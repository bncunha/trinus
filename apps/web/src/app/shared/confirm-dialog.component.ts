import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  template: `
    <section class="confirm-dialog" *ngIf="confirmDialogService.dialog$ | async as dialog">
      <div class="confirm-dialog__backdrop" (click)="confirmDialogService.cancel()"></div>
      <article
        class="confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div>
          <h2 id="confirm-dialog-title">{{ dialog.title }}</h2>
          <p id="confirm-dialog-message">{{ dialog.message }}</p>
        </div>

        <div class="confirm-dialog__actions">
          <button type="button" class="app-button app-button--secondary" (click)="confirmDialogService.cancel()">
            {{ dialog.cancelLabel }}
          </button>
          <button type="button" class="app-button" (click)="confirmDialogService.confirm()">
            {{ dialog.confirmLabel }}
          </button>
        </div>
      </article>
    </section>
  `,
  styles: [
    `
      .confirm-dialog {
        position: fixed;
        inset: 0;
        z-index: 90;
        display: grid;
        place-items: center;
        padding: 18px;
      }

      .confirm-dialog__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(8, 24, 19, 0.42);
        animation: confirm-dialog-fade-in 160ms ease;
      }

      .confirm-dialog__panel {
        position: relative;
        z-index: 1;
        width: min(420px, 100%);
        display: grid;
        gap: 22px;
        padding: 22px;
        border: 1px solid var(--color-border);
        border-radius: 8px;
        background: var(--color-surface);
        box-shadow: 0 22px 64px rgba(8, 24, 19, 0.24);
        animation: confirm-dialog-panel-in 180ms ease;
      }

      .confirm-dialog__panel h2 {
        margin: 0;
        font-size: 1.2rem;
      }

      .confirm-dialog__panel p {
        margin: 10px 0 0;
        color: var(--color-muted);
        line-height: 1.55;
      }

      .confirm-dialog__actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      @media (max-width: 719px) {
        .confirm-dialog {
          align-items: end;
          padding: 12px;
        }

        .confirm-dialog__panel {
          width: 100%;
        }

        .confirm-dialog__actions,
        .confirm-dialog__actions .app-button {
          width: 100%;
        }

        .confirm-dialog__actions {
          flex-direction: column-reverse;
        }
      }

      @keyframes confirm-dialog-fade-in {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      @keyframes confirm-dialog-panel-in {
        from {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  protected readonly confirmDialogService = inject(ConfirmDialogService);
}
