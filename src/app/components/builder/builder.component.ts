import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Category, Product } from '@models/product.model';
import { BuilderService } from '@services/builder.service';
import { PRODUCTS } from 'src/app/data/mock-products';

@Component({
  selector: 'app-builder',
  imports: [],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponent {
  public builderService: BuilderService = inject(BuilderService);

  public categories: { key: Category; label: string }[] = [
    { key: 'cpu', label: 'Processor' },
    { key: 'motherboard', label: 'Motherboard' },
    { key: 'ram', label: 'RAM' },
    { key: 'gpu', label: 'Video card' },
    { key: 'psu', label: 'Power supply unit' },
  ];

  public allProducts = PRODUCTS;

  public getProductsByCategory(category: Category): Product[] {
    return this.allProducts.filter((p) => p.category === category);
  }

  public selectProduct(category: Category, product: Product): void {
    this.builderService.selectProduct(category, product);
  }
}
