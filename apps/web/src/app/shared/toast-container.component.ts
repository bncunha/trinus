import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  template: `
    <section class="toast-container" aria-live="polite" aria-atomic="true" *ngIf="toastService.toast$ | async as toast">
      <article class="toast-container__toast" [class]="'toast-container__toast toast-container__toast--' + toast.kind">
        <div>
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
        <button type="button" class="toast-container__close" (click)="toastService.clear()" aria-label="Fechar mensagem">
          Fechar
        </button>
      </article>
    </section>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 100;
        width: min(420px, calc(100vw - 36px));
        pointer-events: none;
      }

      .toast-container__toast {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        box-shadow: 0 18px 48px rgba(8, 24, 19, 0.18);
        color: var(--color-text);
        pointer-events: auto;
        animation: toast-container-in 180ms ease;
      }

      .toast-container__toast--success {
        border-color: rgba(31, 122, 91, 0.28);
        background: #e8f6ef;
      }

      .toast-container__toast--warning {
        border-color: rgba(162, 124, 12, 0.34);
        background: #fff6cf;
      }

      .toast-container__toast--danger {
        border-color: rgba(184, 63, 57, 0.34);
        background: #fdecea;
      }

      .toast-container__toast strong {
        display: block;
        margin-bottom: 4px;
        font-weight: 700;
      }

      .toast-container__toast p {
        margin: 0;
        color: var(--color-muted);
      }

      .toast-container__close {
        border: 0;
        background: transparent;
        color: var(--color-primary);
        cursor: pointer;
        font: inherit;
        font-weight: 700;
      }

      @media (max-width: 719px) {
        .toast-container {
          top: 12px;
          right: 12px;
          width: calc(100vw - 24px);
        }

        .toast-container__toast {
          flex-direction: column;
        }
      }

      @keyframes toast-container-in {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
