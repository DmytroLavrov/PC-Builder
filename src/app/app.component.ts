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
  protected readonly title = signal('PC-Builder');
}
