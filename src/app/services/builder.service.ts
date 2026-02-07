import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Category, PCBuild, Product, SavedBuild, SortOption } from '@models/product.model';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '@env/environment';

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  [key: string]: any; // For dynamic specs (specs.socket etc.)
}

@Injectable({
  providedIn: 'root',
})
export class BuilderService {
  private http: HttpClient = inject(HttpClient);

  public activeCategoryProducts = signal<Product[]>([]);
  public isLoading = signal<boolean>(false);
  public totalItems = signal<number>(0);

  private currentCategory = signal<Category | null>(null);
  private currentPage = signal<number>(1);
  private readonly itemsPerPage = 24;
  private currentSort = signal<SortOption>('default');
  private currentSearch = signal<string>('');

  public build = signal<PCBuild>({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
  });
  public savedBuilds = signal<SavedBuild[]>([]);
  public currentBuildId = signal<string | null>(null);
  public currentBuildName = signal<string>('Untitled Build');

  private currentFilters = signal<FilterState>({});

  constructor() {
    this.loadSavedBuilds();

    // Auto-save current build
    effect(() => {
      const currentBuild = this.build();
      const buildId = this.currentBuildId();
      const buildName = this.currentBuildName();

      if (buildId) {
        this.updateSavedBuild(buildId, currentBuild, buildName);
      }
    });
  }

  public loadProductsByCategory(category: Category): void {
    this.currentCategory.set(category);
    this.currentPage.set(1);
    this.currentSort.set('default');
    this.currentSearch.set('');
    this.currentFilters.set({});
    this.activeCategoryProducts.set([]);

    this.fetchData();
  }

  public setFilters(filters: FilterState): void {
    this.currentFilters.set(filters);
    this.currentPage.set(1);
    this.fetchData();
  }

  public loadMoreProducts(): void {
    const currentCount = this.activeCategoryProducts().length;
    if (currentCount >= this.totalItems()) return;

    this.currentPage.update((p) => p + 1);
    this.fetchData(true);
  }

  public setSort(sort: SortOption): void {
    this.currentSort.set(sort);
    this.currentPage.set(1);
    this.fetchData();
  }

  public setSearch(query: string): void {
    this.currentSearch.set(query);
    this.currentPage.set(1);
    this.fetchData();
  }

  private fetchData(append: boolean = false): void {
    const category = this.currentCategory();
    if (!category) return;

    this.isLoading.set(true);

    let params = new HttpParams()
      .set('category', category)
      .set('_page', this.currentPage())
      .set('_limit', this.itemsPerPage);

    if (this.currentSearch()) {
      params = params.set('q', this.currentSearch());
    }

    const sort = this.currentSort();
    if (sort !== 'default') {
      switch (sort) {
        case 'price-asc':
          params = params.set('_sort', 'price').set('_order', 'asc');
          break;
        case 'price-desc':
          params = params.set('_sort', 'price').set('_order', 'desc');
          break;
        case 'name':
          params = params.set('_sort', 'name').set('_order', 'asc');
          break;
      }
    }

    const filters = this.currentFilters();
    if (filters.minPrice) params = params.set('price_gte', filters.minPrice);
    if (filters.maxPrice) params = params.set('price_lte', filters.maxPrice);

    Object.keys(filters).forEach((key) => {
      if (key !== 'minPrice' && key !== 'maxPrice' && filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    const baseUrl = environment.apiUrl.endsWith('/products')
      ? environment.apiUrl
      : `${environment.apiUrl}/products`;

    this.http.get<Product[]>(baseUrl, { params, observe: 'response' }).subscribe({
      next: (resp: HttpResponse<Product[]>) => {
        const newData = resp.body || [];

        const totalHeader = resp.headers.get('X-Total-Count');
        if (totalHeader) {
          this.totalItems.set(Number(totalHeader));
        } else {
          if (!append) this.totalItems.set(newData.length);
        }

        if (append) {
          this.activeCategoryProducts.update((current) => [...current, ...newData]);
        } else {
          this.activeCategoryProducts.set(newData);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.isLoading.set(false);
      },
    });
  }

  public getCompatibleProducts(category: Category): Product[] {
    return this.activeCategoryProducts();
  }

  public selectProduct(category: Category, product: Product): void {
    this.build.update((current) => ({
      ...current,
      [category]: product,
    }));
  }

  public removeProduct(category: Category): void {
    this.build.update((current) => ({
      ...current,
      [category]: null,
    }));
  }

  public totalPrice = computed(() => {
    const b = this.build();
    return Object.values(b)
      .filter((p): p is Product => p !== null)
      .reduce((total, product) => total + product.price, 0);
  });

  public selectedItemsCount = computed(() => {
    const b = this.build();
    return Object.values(b).filter((p) => p !== null).length;
  });

  public totalWattage = computed(() => {
    const b = this.build();
    // Assume the base system consumption is 50W
    let total = 50;
    Object.values(b).forEach((p) => {
      if (p?.specs.wattage && p.category !== 'psu') {
        total += p.specs.wattage;
      }
    });

    return total;
  });

  public compatibilityIssues = computed(() => {
    const b = this.build();
    const errors: string[] = [];

    // Check: Processor <-> Motherboard (Socket)
    if (b.cpu && b.motherboard) {
      if (b.cpu.specs.socket !== b.motherboard.specs.socket) {
        errors.push(
          `Incompatibility: CPU requires socket ${b.cpu.specs.socket}, and motherboard has ${b.motherboard.specs.socket}`,
        );
      }
    }

    // Check: RAM <-> Motherboard (DDR type)
    if (b.ram && b.motherboard) {
      if (b.ram.specs.memoryType !== b.motherboard.specs.memoryType) {
        errors.push(
          `Incompatibility: Board supports ${b.motherboard.specs.memoryType}, and memory ${b.ram.specs.memoryType}`,
        );
      }
    }

    // Check: Power supply (is there enough power)
    if (b.psu && b.psu.specs.wattage! < this.totalWattage()) {
      errors.push(
        `Warning: Power supply too weak! Consumption: ${this.totalWattage()}W, PSU: ${b.psu.specs.wattage}W`,
      );
    }

    // Check: CASE vs BOARD
    if (b.case && b.motherboard) {
      const caseSize = b.case.specs.formFactor;
      const boardSize = b.motherboard.specs.formFactor;
      if (caseSize === 'Micro-ATX' && boardSize === 'ATX') {
        errors.push(
          `Physical incompatibility: Board ${boardSize} will not fit in case ${caseSize}!`,
        );
      }

      if (caseSize === 'Mini-ITX' && (boardSize === 'ATX' || boardSize === 'Micro-ATX')) {
        errors.push(`The board is too big for this Mini-ITX case.`);
      }
    }

    return errors;
  });

  private loadSavedBuilds(): void {
    const saved = localStorage.getItem('pc-builds');
    if (saved) {
      try {
        const builds = JSON.parse(saved) as SavedBuild[];
        this.savedBuilds.set(builds);

        // Load the last active build or create new one
        const lastActiveId = localStorage.getItem('last-active-build-id');
        if (lastActiveId && builds.find((b) => b.id === lastActiveId)) {
          this.loadBuild(lastActiveId);
        } else if (builds.length > 0) {
          this.loadBuild(builds[0].id);
        } else {
          this.createNewBuild('My First Build');
        }
      } catch (e) {
        console.error('Corrupted save file');
        this.createNewBuild('My First Build');
      }
    } else {
      this.createNewBuild('My First Build');
    }
  }

  private saveBuildsToStorage(): void {
    localStorage.setItem('pc-builds', JSON.stringify(this.savedBuilds()));
    if (this.currentBuildId()) {
      localStorage.setItem('last-active-build-id', this.currentBuildId()!);
    }
  }

  public createNewBuild(name: string = 'New Build'): void {
    const newBuild: SavedBuild = {
      id: crypto.randomUUID(),
      name,
      build: {
        cpu: null,
        motherboard: null,
        ram: null,
        gpu: null,
        storage: null,
        psu: null,
        case: null,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.savedBuilds.update((builds) => [newBuild, ...builds]);
    this.currentBuildId.set(newBuild.id);
    this.currentBuildName.set(newBuild.name);
    this.build.set(newBuild.build);
    this.saveBuildsToStorage();
  }

  public loadBuild(id: string): void {
    const savedBuild = this.savedBuilds().find((b) => b.id === id);
    if (savedBuild) {
      this.currentBuildId.set(savedBuild.id);
      this.currentBuildName.set(savedBuild.name);
      this.build.set(savedBuild.build);
      this.saveBuildsToStorage();
    }
  }

  public updateSavedBuild(id: string, build: PCBuild, name: string): void {
    this.savedBuilds.update((builds) => {
      const index = builds.findIndex((b) => b.id === id);
      if (index !== -1) {
        builds[index] = {
          ...builds[index],
          name,
          build,
          updatedAt: Date.now(),
        };
      }
      return [...builds];
    });
    this.saveBuildsToStorage();
  }

  public deleteBuild(id: string): void {
    const builds = this.savedBuilds();
    const index = builds.findIndex((b) => b.id === id);

    if (index === -1) return;

    // If deleting current build, switch to another
    if (this.currentBuildId() === id) {
      const nextBuild = builds[index + 1] || builds[index - 1];
      if (nextBuild) {
        this.loadBuild(nextBuild.id);
      } else {
        // No builds left, create new one
        this.savedBuilds.update((builds) => builds.filter((b) => b.id !== id));
        this.createNewBuild('My Build');
        return;
      }
    }

    this.savedBuilds.update((builds) => builds.filter((b) => b.id !== id));
    this.saveBuildsToStorage();
  }

  public renameBuild(name: string): void {
    this.currentBuildName.set(name);
  }

  public duplicateBuild(id: string): void {
    const original = this.savedBuilds().find((b) => b.id === id);
    if (!original) return;

    const duplicate: SavedBuild = {
      id: crypto.randomUUID(),
      name: `${original.name} (Copy)`,
      build: { ...original.build },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.savedBuilds.update((builds) => [duplicate, ...builds]);
    this.saveBuildsToStorage();
  }
}
