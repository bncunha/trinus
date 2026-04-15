import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ConfirmDialogConfig = {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export type ResolvedConfirmDialogConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private readonly dialogSubject = new BehaviorSubject<ResolvedConfirmDialogConfig | null>(null);

  readonly dialog$ = this.dialogSubject.asObservable();

  open(config: ConfirmDialogConfig): void {
    this.dialogSubject.next({
      title: config.title?.trim() || 'Confirmar ação',
      message: config.message?.trim() || 'Deseja continuar?',
      confirmLabel: config.confirmLabel?.trim() || 'Continuar',
      cancelLabel: config.cancelLabel?.trim() || 'Cancelar',
      onConfirm: config.onConfirm ?? (() => undefined),
      onCancel: config.onCancel ?? (() => undefined)
    });
  }

  confirm(): void {
    const dialog = this.dialogSubject.value;
    this.close();
    dialog?.onConfirm();
  }

  cancel(): void {
    const dialog = this.dialogSubject.value;
    this.close();
    dialog?.onCancel();
  }

  close(): void {
    this.dialogSubject.next(null);
  }
}
