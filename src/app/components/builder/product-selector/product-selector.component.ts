import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Product } from '@models/product.model';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

@Component({
  selector: 'app-product-selector',
  imports: [],
  templateUrl: './product-selector.component.html',
  styleUrl: './product-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSelectorComponent {
  @Input({ required: true }) categoryLabel!: string;
  @Input({ required: true }) products!: Product[];
  @Input() totalCount: number = 0;

  @Output() select = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();

  public defaultImage = 'https://placehold.co/600x400/1e293b/ffffff?text=PC+Component';

  public currentSort = signal<SortOption>('default');

  public get sortedProducts(): Product[] {
    const sort = this.currentSort();

    if (sort === 'default') {
      return this.products;
    }

    return [...this.products].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  public setSort(option: SortOption): void {
    this.currentSort.set(option);
  }

  public onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.setSort(value);
  }

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
