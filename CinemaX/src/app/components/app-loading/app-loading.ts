import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-loading" [class.app-loading--compact]="compact" role="status" aria-live="polite">
      <div class="app-loading__spinner"></div>
      <p>{{ label }}</p>
    </div>
  `,
  styles: [
    `
      .app-loading {
        min-height: 220px;
        display: grid;
        place-items: center;
        gap: 1rem;
        text-align: center;
        color: #e8dbc1;
      }

      .app-loading--compact {
        min-height: 140px;
      }

      .app-loading__spinner {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        border: 3px solid rgba(226, 183, 47, 0.16);
        border-top-color: #e2b72f;
        animation: app-loading-spin 0.8s linear infinite;
        box-shadow: 0 0 30px rgba(226, 183, 47, 0.14);
      }

      .app-loading p {
        margin: 0;
        font-size: 1rem;
        letter-spacing: 0.02em;
      }

      @keyframes app-loading-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class AppLoadingComponent {
  @Input() label = 'Loading...';
  @Input() compact = false;
}
