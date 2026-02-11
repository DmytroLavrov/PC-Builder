import { computed, effect, inject, Injectable, signal } from '@angular/core';
import {
  Category,
  PCBuild,
  Product,
  ProductFilter,
  SavedBuild,
  SortOption,
} from '@models/product.model';
import { HttpResponse } from '@angular/common/http';
import { ProductApiService } from '@services/product-api.service';
import { StorageService } from '@services/storage.service';
import { CompatibilityValidator } from '@utils/compatibility.validator';

@Injectable({
  providedIn: 'root',
})
export class BuilderService {
  private apiService: ProductApiService = inject(ProductApiService);
  private storage: StorageService = inject(StorageService);

  public activeCategoryProducts = signal<Product[]>([]);
  public isLoading = signal<boolean>(false);
  public totalItems = signal<number>(0);

  private currentCategory = signal<Category | null>(null);
  private currentPage = signal<number>(1);
  private readonly itemsPerPage = 24;
  private currentSort = signal<SortOption>('default');
  private currentSearch = signal<string>('');
  private currentFilters = signal<ProductFilter>({});

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

  // --- API / Data Loading Section ---

  public loadProductsByCategory(category: Category): void {
    this.currentCategory.set(category);
    this.currentPage.set(1);
    this.currentSort.set('default');
    this.currentSearch.set('');
    this.currentFilters.set({});
    this.activeCategoryProducts.set([]);
    this.fetchData();
  }

  public setFilters(filters: ProductFilter): void {
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

    this.apiService
      .getProducts(
        category,
        this.currentPage(),
        this.itemsPerPage,
        this.currentSort(),
        this.currentSearch(),
        this.currentFilters(),
      )
      .subscribe({
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

  // --- Build Management Section ---

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

  // --- Computations ---

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
    return CompatibilityValidator.validate(this.build(), this.totalWattage());
  });

  // --- Persistence Section  ---

  private loadSavedBuilds(): void {
    const builds = this.storage.getItem<SavedBuild[]>('pc-builds');

    if (builds) {
      this.savedBuilds.set(builds);
      const lastActiveId = this.storage.getItem<string>('last-active-build-id');

      if (lastActiveId && builds.find((b) => b.id === lastActiveId)) {
        this.loadBuild(lastActiveId);
      } else if (builds.length > 0) {
        this.loadBuild(builds[0].id);
      } else {
        this.createNewBuild('My First Build');
      }
    } else {
      this.createNewBuild('My First Build');
    }
  }

  private saveBuildsToStorage(): void {
    this.storage.setItem('pc-builds', this.savedBuilds());
    if (this.currentBuildId()) {
      this.storage.setItem('last-active-build-id', this.currentBuildId());
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
