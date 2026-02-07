import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  EventEmitter,
  Input,
  Output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category, Product, SortOption } from '@models/product.model';
import { ProductCardComponent } from '@components/builder/product-card/product-card.component';

@Component({
  selector: 'app-product-selector',
  imports: [FormsModule, ProductCardComponent],
  templateUrl: './product-selector.component.html',
  styleUrl: './product-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectorComponent {
  @Input({ required: true }) categoryLabel!: string;
  @Input({ required: true }) products!: Product[];
  @Input() totalCount: number = 0;
  @Input() isLoading: boolean = false;
  @Input() activeCategoryKey!: Category;

  @Output() select = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<SortOption>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();
  @Output() filtersChange = new EventEmitter<any>();

  public currentSort: SortOption = 'default';

  public searchQuery = signal<string>('');
  public skeletonItems = new Array(12);
  public showFilters = signal<boolean>(false);

  public filterModel = {
    minPrice: null as number | null,
    maxPrice: null as number | null,
    specs: {} as { [key: string]: string },
  };

  public currentSpecFilters = computed(() => {
    switch (this.activeCategoryKey) {
      case 'cpu':
        return [
          { key: 'specs.socket', label: 'Socket', options: ['AM5', 'AM4', 'LGA1700', 'LGA1200'] },
        ];
      case 'motherboard':
        return [
          { key: 'specs.socket', label: 'Socket', options: ['AM5', 'AM4', 'LGA1700'] },
          { key: 'specs.memoryType', label: 'Memory', options: ['DDR4', 'DDR5'] },
        ];
      case 'ram':
        return [
          { key: 'specs.memoryType', label: 'Type', options: ['DDR4', 'DDR5'] },
          { key: 'specs.wattage', label: 'Wattage', options: ['4', '5', '6', '7', '8', '9', '10'] },
        ];
      case 'gpu':
        return [
          {
            key: 'specs.vram',
            label: 'VRAM',
            options: ['8GB', '10GB', '12GB', '16GB', '20GB', '24GB'],
          },
        ];
      case 'psu':
        return [
          {
            key: 'specs.wattage',
            label: 'Wattage',
            options: ['500', '600', '650', '750', '850', '1000', '1200', '1300', '1600'],
          },
        ];
      case 'storage':
        return [];
      default:
        return [];
    }
  });

  public get hasActiveFilters(): boolean {
    const hasPrice = !!this.filterModel.minPrice || !!this.filterModel.maxPrice;

    const hasSpecs = Object.values(this.filterModel.specs).some((val) => val !== '');

    return hasPrice || hasSpecs;
  }

  constructor() {
    effect(() => {
      const specsConfig = this.currentSpecFilters();

      untracked(() => {
        this.initFilters(specsConfig);
      });
    });
  }

  private initFilters(specsConfig: any[]) {
    const specs: { [key: string]: string } = {};

    specsConfig.forEach((spec) => {
      specs[spec.key] = '';
    });

    this.filterModel.specs = specs;
    this.filterModel.minPrice = null;
    this.filterModel.maxPrice = null;
  }

  public toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  public applyFilters(): void {
    const filters: any = {};

    if (this.filterModel.minPrice) filters.minPrice = this.filterModel.minPrice;
    if (this.filterModel.maxPrice) filters.maxPrice = this.filterModel.maxPrice;

    this.currentSpecFilters().forEach((spec) => {
      const value = this.filterModel.specs[spec.key];
      if (value) {
        filters[spec.key] = value;
      }
    });

    this.filtersChange.emit(filters);
    this.showFilters.set(false);
  }

  public resetFilters(): void {
    this.initFilters(this.currentSpecFilters());
    this.filtersChange.emit({});
  }

  public onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.currentSort = value;
    this.sortChange.emit(value);
  }

  public onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  public clearSearch(input: HTMLInputElement): void {
    input.value = '';
    this.searchChange.emit('');
  }
}
