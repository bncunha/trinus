import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from '../confirm-dialog.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let confirmDialogService: ConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent]
    }).compileComponents();

    confirmDialogService = TestBed.inject(ConfirmDialogService);
  });

  it('renders the active confirmation dialog', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);

    confirmDialogService.open({
      title: 'Excluir item?',
      message: 'Esta acao nao podera ser desfeita.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar'
    });
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Excluir item?');
    expect(host.textContent).toContain('Esta acao nao podera ser desfeita.');
    expect(host.textContent).toContain('Excluir');
  });

  it('confirms using the service callback', () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const onConfirm = jest.fn();

    confirmDialogService.open({
      title: 'Confirmar',
      message: 'Continuar?',
      confirmLabel: 'Continuar',
      onConfirm
    });
    fixture.detectChanges();

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'));
    buttons.find((button) => button.textContent?.includes('Continuar'))?.click();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
