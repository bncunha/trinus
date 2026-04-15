import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import type { CreateOrderInput, Order } from '@trinus/contracts';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { OrdersService } from '../../services-api/orders.service';
import { ToastService } from '../../shared/toast.service';
import { OrderFormPageComponent } from './order-form-page.component';

class OrdersServiceStub {
  readonly orders$ = new BehaviorSubject<Order[]>([
    {
      id: 'ORD-2001',
      orderNumber: '2001',
      customerName: 'Cia. Aurora',
      status: 'REGISTERED',
      startDate: '2026-04-09',
      deliveryDate: '2026-04-16',
      riskLevel: 'LOW',
      riskReason: 'Pedido dentro do prazo.',
      nextStep: 'Confirmar produção.',
      finalNotes: 'Entregar com etiqueta especial.',
      products: [{ name: 'Calça jogger', quantity: 34 }]
    }
  ]);

  createOrder = jest.fn((request: CreateOrderInput) =>
    of({
      ...request,
      id: 'ORD-2002',
      status: 'REGISTERED',
      startDate: request.startDate ?? '2026-04-10',
      deliveryDate: request.deliveryDate ?? '2026-04-24',
      riskLevel: 'LOW',
      riskReason: 'Pedido dentro do prazo.',
      nextStep: 'Confirmar produção.'
    } satisfies Order)
  );
  updateOrder = jest.fn((id: string, request: Partial<CreateOrderInput>) =>
    of({
      ...this.orders$.value[0],
      ...request,
      id
    } satisfies Order)
  );
}

class ToastServiceStub {
  success = jest.fn();
}

describe('OrderFormPageComponent', () => {
  let fixture: ComponentFixture<OrderFormPageComponent>;
  let ordersService: OrdersServiceStub;
  let paramMapSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let router: Router;

  const setFieldValue = (selector: string, value: string): void => {
    const host = fixture.nativeElement as HTMLElement;
    const field = host.querySelector(selector) as HTMLInputElement;
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    ordersService = new OrdersServiceStub();
    paramMapSubject = new BehaviorSubject(convertToParamMap({}));

    await TestBed.configureTestingModule({
      imports: [OrderFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: OrdersService, useValue: ordersService },
        { provide: ToastService, useClass: ToastServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable()
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(OrderFormPageComponent);
    fixture.detectChanges();
  });

  it('salva um novo pedido', () => {
    const host = fixture.nativeElement as HTMLElement;

    setFieldValue('input[formControlName="customerName"]', 'Loja Horizonte');
    setFieldValue('input[formControlName="orderNumber"]', 'HOR-2040');
    setFieldValue('input[formControlName="name"]', 'Camiseta polo');
    setFieldValue('input[formControlName="quantity"]', '80.25');
    setFieldValue('input[formControlName="startDate"]', '2026-04-12');
    setFieldValue('input[formControlName="deliveryDate"]', '2026-04-24');
    setFieldValue('textarea[formControlName="finalNotes"]', 'Separar por tamanho.');

    const submitButton = host.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(ordersService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: 'Loja Horizonte',
        orderNumber: 'HOR-2040',
        startDate: '2026-04-12',
        deliveryDate: '2026-04-24',
        finalNotes: 'Separar por tamanho.',
        products: [{ name: 'Camiseta polo', quantity: 80.25 }]
      })
    );
    expect(TestBed.inject(ToastService).success).toHaveBeenCalledWith('Pedido salvo', 'Pedido salvo com sucesso.');
  });

  it('substitui erro de API por feedback de validação', () => {
    const host = fixture.nativeElement as HTMLElement;
    ordersService.createOrder.mockReturnValueOnce(throwError(() => new Error('api indisponível')));

    setFieldValue('input[formControlName="customerName"]', 'Loja Horizonte');
    setFieldValue('input[formControlName="orderNumber"]', 'HOR-2040');
    setFieldValue('input[formControlName="name"]', 'Camiseta polo');
    setFieldValue('input[formControlName="quantity"]', '80.25');
    setFieldValue('input[formControlName="startDate"]', '2026-04-12');
    setFieldValue('input[formControlName="deliveryDate"]', '2026-04-24');

    const submitButton = host.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Não foi possível salvar o pedido.');

    setFieldValue('input[formControlName="customerName"]', '');
    submitButton.click();
    fixture.detectChanges();

    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Corrija os campos destacados antes de salvar.');
  });

  it('carrega um pedido existente e atualiza', () => {
    const host = fixture.nativeElement as HTMLElement;

    paramMapSubject.next(convertToParamMap({ id: 'ORD-2001' }));
    ordersService.orders$.next([...ordersService.orders$.value]);
    fixture.detectChanges();

    const customerField = host.querySelector('input[formControlName="customerName"]') as HTMLInputElement;
    expect(customerField.value).toBe('Cia. Aurora');

    customerField.value = 'Cia. Aurora Atualizada';
    customerField.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = host.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(ordersService.updateOrder).toHaveBeenCalledWith(
      'ORD-2001',
      expect.objectContaining({
        customerName: 'Cia. Aurora Atualizada'
      })
    );
    expect(TestBed.inject(ToastService).success).toHaveBeenCalledWith(
      'Pedido atualizado',
      'Pedido atualizado com sucesso.'
    );
  });

  it('adiciona múltiplos itens ao pedido', () => {
    const host = fixture.nativeElement as HTMLElement;

    setFieldValue('input[formControlName="customerName"]', 'Loja Horizonte');
    setFieldValue('input[formControlName="orderNumber"]', 'HOR-2040');
    setFieldValue('input[formControlName="startDate"]', '2026-04-12');
    setFieldValue('input[formControlName="deliveryDate"]', '2026-04-24');
    setFieldValue('input[formControlName="name"]', 'Camiseta polo');
    setFieldValue('input[formControlName="quantity"]', '80.25');

    const addButton = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
      (button) => button.textContent?.trim() === 'Adicionar item'
    ) as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    const productNames = host.querySelectorAll<HTMLInputElement>('input[formControlName="name"]');
    const productQuantities = host.querySelectorAll<HTMLInputElement>('input[formControlName="quantity"]');
    productNames[1].value = 'Moletom';
    productNames[1].dispatchEvent(new Event('input'));
    productQuantities[1].value = '12';
    productQuantities[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = host.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(ordersService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        products: [
          { name: 'Camiseta polo', quantity: 80.25 },
          { name: 'Moletom', quantity: 12 }
        ]
      })
    );
  });

  it('rejeita quantidade com mais de duas casas decimais', () => {
    const host = fixture.nativeElement as HTMLElement;

    setFieldValue('input[formControlName="customerName"]', 'Loja Horizonte');
    setFieldValue('input[formControlName="orderNumber"]', 'HOR-2040');
    setFieldValue('input[formControlName="startDate"]', '2026-04-12');
    setFieldValue('input[formControlName="deliveryDate"]', '2026-04-24');
    setFieldValue('input[formControlName="name"]', 'Camiseta polo');
    setFieldValue('input[formControlName="quantity"]', '1.234');

    const submitButton = host.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(ordersService.createOrder).not.toHaveBeenCalled();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      'Existem campos incompletos nos itens do pedido.'
    );
    expect(host.textContent).toContain('Use no máximo 2 casas decimais.');
  });
});
