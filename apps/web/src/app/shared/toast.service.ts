import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'warning' | 'danger';

export type ToastMessage = {
  kind: ToastKind;
  title?: string;
  message?: string;
  durationMs?: number;
};

export type ResolvedToastMessage = {
  kind: ToastKind;
  title: string;
  message: string;
  durationMs: number;
};

const DEFAULT_TOAST_DURATION_MS = 5000;

const DEFAULT_TOAST_CONTENT: Record<ToastKind, { title: string; message: string }> = {
  success: {
    title: 'Tudo certo',
    message: 'Ação concluída com sucesso.'
  },
  warning: {
    title: 'Atenção',
    message: 'Revise as informações e tente novamente.'
  },
  danger: {
    title: 'Não foi possível concluir',
    message: 'Tente novamente em instantes.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly toastSubject = new BehaviorSubject<ResolvedToastMessage | null>(null);
  private closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly toast$ = this.toastSubject.asObservable();

  show(toast: ToastMessage): void {
    const defaults = DEFAULT_TOAST_CONTENT[toast.kind];
    const durationMs = toast.durationMs ?? DEFAULT_TOAST_DURATION_MS;

    this.toastSubject.next({
      kind: toast.kind,
      title: toast.title?.trim() || defaults.title,
      message: toast.message?.trim() || defaults.message,
      durationMs
    });

    this.scheduleClear(durationMs);
  }

  success(title?: string, message?: string): void {
    this.show({ kind: 'success', title, message });
  }

  warning(title?: string, message?: string): void {
    this.show({ kind: 'warning', title, message });
  }

  danger(title?: string, message?: string): void {
    this.show({ kind: 'danger', title, message });
  }

  clear(): void {
    this.clearScheduledClose();
    this.toastSubject.next(null);
  }

  private scheduleClear(durationMs: number): void {
    this.clearScheduledClose();

    if (durationMs <= 0) {
      return;
    }

    this.closeTimeoutId = setTimeout(() => {
      this.clear();
    }, durationMs);
  }

  private clearScheduledClose(): void {
    if (!this.closeTimeoutId) {
      return;
    }

    clearTimeout(this.closeTimeoutId);
    this.closeTimeoutId = null;
  }
}
