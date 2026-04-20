import { TestBed } from '@angular/core/testing';
import { ToastService } from '../toast.service';
import { ToastContainerComponent } from './toast-container.component';

describe('ToastContainerComponent', () => {
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent]
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
  });

  it('renders the active toast message', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);

    toastService.success('Salvo', 'Registro salvo com sucesso.');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Salvo');
    expect(host.textContent).toContain('Registro salvo com sucesso.');
  });

  it('clears the toast from the close action', () => {
    const fixture = TestBed.createComponent(ToastContainerComponent);

    toastService.warning('Revise', 'Campos obrigatorios pendentes.');
    fixture.detectChanges();

    const closeButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Fechar mensagem"]'
    );
    closeButton?.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Revise');
  });
});
