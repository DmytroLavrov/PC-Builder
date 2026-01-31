import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  public themeService: ThemeService = inject(ThemeService);

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
