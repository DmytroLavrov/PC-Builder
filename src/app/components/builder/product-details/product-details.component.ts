import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@models/product.model';

@Component({
  selector: 'app-product-details',
  imports: [TitleCasePipe],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailsComponent {
  @Input({ required: true }) product!: Product;
  @Input() defaultImage: string = '';

  @Output() close = new EventEmitter<void>();
  @Output() select = new EventEmitter<Product>();

  public get specsArray() {
    return Object.entries(this.product.specs).map(([key, value]) => ({
      key: key.replace(/([A-Z])/g, ' $1').trim(),
      value,
    }));
  }

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
