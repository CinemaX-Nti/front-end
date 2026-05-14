import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-movie-trailer-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="trailer-modal" (click)="close.emit()">
      <div class="trailer-modal__dialog" (click)="$event.stopPropagation()">
        <button type="button" class="trailer-modal__close" aria-label="Close trailer" (click)="close.emit()">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="trailer-modal__header">
          <span class="trailer-modal__eyebrow">Now Playing</span>
          <h2>{{ title || 'Movie Trailer' }}</h2>
        </div>

        <div class="trailer-modal__frame" *ngIf="safeTrailerUrl; else trailerUnavailable">
          <iframe
            [src]="safeTrailerUrl"
            [title]="title ? title + ' trailer' : 'Movie trailer'"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>

        <ng-template #trailerUnavailable>
          <div class="trailer-modal__empty">
            <i class="bi bi-film"></i>
            <p>Trailer unavailable for this movie right now.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .trailer-modal {
        position: fixed;
        inset: 0;
        z-index: 1050;
        padding: 1.5rem;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top, rgba(226, 183, 47, 0.14), transparent 28%),
          rgba(4, 4, 7, 0.86);
        backdrop-filter: blur(12px);
        animation: trailer-fade-in 0.28s ease;
      }

      .trailer-modal__dialog {
        position: relative;
        width: min(960px, 100%);
        padding: 1.35rem;
        border-radius: 1.6rem;
        border: 1px solid rgba(226, 183, 47, 0.18);
        background: linear-gradient(180deg, #15151c 0%, #0f1015 100%);
        box-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
        transform-origin: center;
        animation: trailer-rise-in 0.3s ease;
      }

      .trailer-modal__close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 2.75rem;
        height: 2.75rem;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        color: #fff;
      }

      .trailer-modal__header {
        margin-bottom: 1rem;
        padding-right: 3rem;
      }

      .trailer-modal__eyebrow {
        display: inline-block;
        margin-bottom: 0.45rem;
        color: #e2b72f;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .trailer-modal__header h2 {
        margin: 0;
        color: #fff;
        font-size: clamp(1.6rem, 2.8vw, 2.3rem);
        font-weight: 800;
      }

      .trailer-modal__frame {
        overflow: hidden;
        border-radius: 1.2rem;
        background: #05060a;
        aspect-ratio: 16 / 9;
      }

      .trailer-modal__frame iframe {
        width: 100%;
        height: 100%;
        border: 0;
      }

      .trailer-modal__empty {
        min-height: 300px;
        display: grid;
        place-items: center;
        gap: 0.75rem;
        border-radius: 1.2rem;
        border: 1px dashed rgba(226, 183, 47, 0.2);
        color: #d7dbea;
      }

      .trailer-modal__empty i {
        font-size: 2rem;
        color: #e2b72f;
      }

      .trailer-modal__empty p {
        margin: 0;
      }

      @keyframes trailer-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes trailer-rise-in {
        from {
          opacity: 0;
          transform: translateY(18px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `,
  ],
})
export class MovieTrailerModalComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() open = false;
  @Input() title = '';

  @Input()
  set trailerUrl(value: string | undefined | null) {
    const normalized = this.toEmbedUrl(value);
    this.safeTrailerUrl = normalized ? this.sanitizer.bypassSecurityTrustResourceUrl(normalized) : null;
  }

  @Output() readonly close = new EventEmitter<void>();

  safeTrailerUrl: SafeResourceUrl | null = null;

  private toEmbedUrl(value?: string | null): string | null {
    if (!value?.trim()) {
      return null;
    }

    try {
      const url = new URL(value);
      const hostname = url.hostname.replace('www.', '');

      if (hostname === 'youtu.be') {
        const id = url.pathname.replace('/', '');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
        const watchId = url.searchParams.get('v');
        if (watchId) {
          return `https://www.youtube.com/embed/${watchId}`;
        }

        if (url.pathname.startsWith('/embed/')) {
          return value;
        }

        if (url.pathname.startsWith('/shorts/')) {
          const shortId = url.pathname.split('/')[2];
          return shortId ? `https://www.youtube.com/embed/${shortId}` : null;
        }
      }

      return this.sanitizer.sanitize(SecurityContext.URL, value) ?? null;
    } catch {
      return null;
    }
  }
}
