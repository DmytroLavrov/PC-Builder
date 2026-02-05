import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Product, SortOption } from '@models/product.model';

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
  @Input() isLoading: boolean = false;

  @Output() select = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();

  @Output() sortChange = new EventEmitter<SortOption>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  public defaultImage = 'https://placehold.co/600x400/1e293b/ffffff?text=PC+Component';
  public currentSort: SortOption = 'default';

  public searchQuery = signal<string>('');

  // public loadMore(): void {
  //   this.currentLimit.update((v) => v + this.pageSize);
  // }

  // public setSort(option: SortOption): void {
  //   this.currentSort.set(option);
  // }

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

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
