import { Component, signal } from '@angular/core';
import { BuilderComponent } from '@components/builder/builder.component';

@Component({
  selector: 'app-root',
  imports: [BuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly title = signal('PC-Builder');
}
