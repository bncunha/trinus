import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  it('usa configuracao padrao e executa callback de confirmacao', (done) => {
    const service = TestBed.inject(ConfirmDialogService);
    const onConfirm = jest.fn();

    service.dialog$.subscribe((dialog) => {
      if (!dialog) {
        return;
      }

      expect(dialog.title).toBe('Confirmar ação');
      expect(dialog.message).toBe('Deseja continuar?');
      expect(dialog.confirmLabel).toBe('Continuar');
      expect(dialog.cancelLabel).toBe('Cancelar');

      service.confirm();
      expect(onConfirm).toHaveBeenCalledTimes(1);
      done();
    });

    service.open({ onConfirm });
  });
});
