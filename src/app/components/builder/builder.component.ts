import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Category, Product } from '@models/product.model';
import { BuilderService } from '@services/builder.service';
import { BuildsManagerComponent } from '@components/builder/builds-manager/builds-manager.component';

@Component({
  selector: 'app-builder',
  imports: [BuildsManagerComponent],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponent {
  public builderService: BuilderService = inject(BuilderService);

  public defaultImage = 'https://placehold.co/600x400/1e293b/ffffff?text=PC+Component';

  public categories: { key: Category; label: string }[] = [
    { key: 'cpu', label: 'Processor (CPU)' },
    { key: 'motherboard', label: 'Motherboard' },
    { key: 'ram', label: 'Memory (RAM)' },
    { key: 'gpu', label: 'Graphics Card' },
    { key: 'storage', label: 'Storage (SSD)' },
    { key: 'psu', label: 'Power Supply' },
    { key: 'case', label: 'PC Case' },
  ];

  public getProductsByCategory(category: Category): Product[] {
    return this.builderService.filterProducts(category);
  }

  public selectProduct(category: Category, product: Product): void {
    this.builderService.selectProduct(category, product);
  }

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
