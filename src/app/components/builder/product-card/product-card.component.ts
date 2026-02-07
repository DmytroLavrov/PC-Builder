import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '@models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() product: Product | null = null;
  @Input() isSkeleton: boolean = false;

  @Input() defaultImage: string = 'https://placehold.co/600x400/1e293b/ffffff?text=PC+Component';

  @Output() select = new EventEmitter<Product>();

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
