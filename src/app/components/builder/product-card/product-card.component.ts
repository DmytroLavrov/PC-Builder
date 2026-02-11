import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { Product } from '@models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  @Input() set product(val: Product | null) {
    this._product.set(val);
  }

  private _product = signal<Product | null>(null);

  public productSignal = this._product.asReadonly();

  @Input() isSkeleton: boolean = false;
  @Input() defaultImage: string = 'https://placehold.co/600x400/1e293b/ffffff?text=PC+Component';

  @Output() select = new EventEmitter<Product>();
  @Output() info = new EventEmitter<Product>();

  public specSummary = computed(() => {
    const p = this._product();
    if (!p) return '';

    switch (p.category) {
      case 'cpu':
        return `${p.specs.socket} | ${p.specs.wattage}W`;
      case 'motherboard':
        return `${p.specs.socket} | ${p.specs.formFactor} | ${p.specs.memoryType}`;
      case 'ram':
        return `${p.specs.memoryType} | ${p.specs.capacity}`;
      case 'gpu':
        return `${p.specs.vram} | ${p.specs.length}mm`;
      case 'psu':
        return `${p.specs.wattage}W ${p.specs.modular ? '| Modular' : ''}`;
      case 'storage':
        return `${p.specs.capacity} ${p.specs.type}`;
      case 'case':
        return `${p.specs.formFactor} | Max GPU: ${p.specs.maxGpuLength}mm`;
      default:
        return '';
    }
  });

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  public onInfoClick(event: Event): void {
    event.stopPropagation();
    const p = this._product();
    if (p) {
      this.info.emit(p);
    }
  }
}
