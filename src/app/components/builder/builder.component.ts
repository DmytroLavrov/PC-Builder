import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Category, Product } from '@models/product.model';
import { BuilderService } from '@services/builder.service';
import { BuildsManagerComponent } from '@components/builder/builds-manager/builds-manager.component';
import { ProductSelectorComponent } from '@components/builder/product-selector/product-selector.component';

@Component({
  selector: 'app-builder',
  imports: [BuildsManagerComponent, ProductSelectorComponent],
  templateUrl: './builder.component.html',
  styleUrl: './builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponent {
  public builderService: BuilderService = inject(BuilderService);

  public activeCategory = signal<Category | null>(null);

  public activeCategoryLabel = computed(() => {
    const active = this.activeCategory();
    if (!active) return '';
    return this.categories.find((c) => c.key === active)?.label || '';
  });

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
    return this.builderService.getCompatibleProducts(category);
  }

  public getTotalCountByCategory(category: Category): number {
    return this.builderService.activeCategoryProducts().length;
  }

  public openCategory(category: Category): void {
    this.activeCategory.set(category);
    document.body.style.overflow = 'hidden';

    this.builderService.loadProductsByCategory(category);
  }

  public closeCategory(): void {
    this.activeCategory.set(null);
    document.body.style.overflow = '';
  }

  public selectProduct(category: Category, product: Product): void {
    this.builderService.selectProduct(category, product);
    this.closeCategory();
  }

  public handleMissingImage(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }
}
