import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  it('usa titulo e mensagem padrao quando nao forem informados', (done) => {
    const service = TestBed.inject(ToastService);

    service.toast$.subscribe((toast) => {
      if (!toast) {
        return;
      }

      expect(toast).toEqual({
        kind: 'success',
        title: 'Tudo certo',
        message: 'Ação concluída com sucesso.',
        durationMs: 5000
      });
      done();
    });

    service.show({ kind: 'success' });
  });

  it('fecha automaticamente apos a duracao configurada', () => {
    jest.useFakeTimers();
    const service = TestBed.inject(ToastService);
    const received: Array<unknown> = [];
    const subscription = service.toast$.subscribe((toast) => received.push(toast));

    service.show({ kind: 'warning', durationMs: 1000 });
    jest.advanceTimersByTime(1000);

    expect(received.at(-1)).toBeNull();

    subscription.unsubscribe();
    jest.useRealTimers();
  });
});
