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
    { key: 'cpu', label: 'Processor (CPU)' },
    { key: 'motherboard', label: 'Motherboard' },
    { key: 'ram', label: 'Memory (RAM)' },
    { key: 'gpu', label: 'Graphics Card' },
    { key: 'storage', label: 'Storage (SSD)' },
    { key: 'psu', label: 'Power Supply' },
    { key: 'case', label: 'PC Case' },
  ];

  public allProducts = PRODUCTS;

  public getProductsByCategory(category: Category): Product[] {
    return this.builderService.filterProducts(category, this.allProducts);
  }

  public selectProduct(category: Category, product: Product): void {
    this.builderService.selectProduct(category, product);
  }
}
