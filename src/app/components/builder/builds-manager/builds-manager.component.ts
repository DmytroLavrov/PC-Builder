import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { SavedBuild } from '@models/product.model';
import { BuilderService } from '@services/builder.service';

@Component({
  selector: 'app-builds-manager',
  imports: [],
  templateUrl: './builds-manager.component.html',
  styleUrl: './builds-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildsManagerComponent {
  public builderService: BuilderService = inject(BuilderService);
  public isDropdownOpen = signal(false);

  public toggleDropdown(): void {
    this.isDropdownOpen.update((isOpen) => !isOpen);
  }

  public createNewBuild(): void {
    const name = prompt('Enter build name:', 'New Build');
    if (name) {
      this.builderService.createNewBuild(name);
      this.isDropdownOpen.set(false);
    }
  }

  public loadBuild(id: string): void {
    this.builderService.loadBuild(id);
    this.isDropdownOpen.set(false);
  }

  public deleteBuild(id: string): void {
    const build = this.builderService.savedBuilds().find((b) => b.id === id);
    if (build && confirm(`Delete "${build.name}"?`)) {
      this.builderService.deleteBuild(id);
    }
  }

  public duplicateBuild(id: string): void {
    this.builderService.duplicateBuild(id);
  }

  public renameBuild(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    if (newName) {
      this.builderService.renameBuild(newName);
    }
  }

  public getBuildItemCount(build: SavedBuild): number {
    return Object.values(build.build).filter((p) => p !== null).length;
  }

  public getBuildPrice(build: SavedBuild): number {
    return Object.values(build.build)
      .filter((p) => p !== null)
      .reduce((total, p) => total + p!.price, 0);
  }

  public formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
