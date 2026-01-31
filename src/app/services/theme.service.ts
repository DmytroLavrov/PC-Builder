import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public currentTheme = signal<Theme>('light');

  constructor() {
    const savedTheme = localStorage.getItem('theme') as Theme;

    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }

    this.applyTheme(this.currentTheme());

    effect(() => {
      const theme = this.currentTheme();
      localStorage.setItem('theme', theme);
      this.applyTheme(theme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const hasManualPreference = localStorage.getItem('theme');
      if (!hasManualPreference) {
        this.currentTheme.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  public toggleTheme(): void {
    this.currentTheme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  public setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }
}
