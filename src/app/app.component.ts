import { Component, signal } from '@angular/core';
import { BuilderComponent } from '@components/builder/builder.component';
import { ThemeToggleComponent } from '@components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  imports: [BuilderComponent, ThemeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public isMenuOpen: boolean = false;

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = 'auto';
  }
}
