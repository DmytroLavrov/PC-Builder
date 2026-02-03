import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@models/product.model';

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

  @Output() select = new EventEmitter<Product>();
  @Output() close = new EventEmitter<void>();

  public defaultImage = 'https://placehold.co/600x400/1e293b/ffffff?text=PC+Component';

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
