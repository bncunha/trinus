import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Order, OrderStatus } from '@trinus/contracts';
import { BehaviorSubject, of } from 'rxjs';
import { OrdersService } from '../../../services-api/orders.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog.service';
import { ToastService } from '../../../shared/toast.service';
import { OrdersListPageComponent } from './orders-list-page.component';

class OrdersServiceStub {
  readonly orders$ = new BehaviorSubject<Order[]>([
    {
      id: 'ORD-2002',
      orderNumber: '2002',
      customerId: 'customer_2',
      customerName: 'Malharia Norte',
      status: 'REGISTERED',
      startDate: '2026-04-09',
      deliveryDate: '2026-04-12',
      riskLevel: 'HIGH',
      riskReason: 'Fila acima da capacidade.',
      nextStep: 'Revisar prazo.',
      items: [
        {
          id: 'item_2',
          productId: 'product_2',
          productName: 'Jaqueta',
          position: 0,
          quantityMode: 'SINGLE',
          quantity: 12,
          sizes: [],
          stages: [],
          totalQuantity: 12
        }
      ],
      products: [{ name: 'Jaqueta', quantity: 12 }]
    },
    {
      id: 'ORD-2001',
      orderNumber: '2001',
      customerId: 'customer_1',
      customerName: 'Cia. Aurora',
      status: 'REGISTERED',
      startDate: '2026-04-09',
      deliveryDate: '2026-04-10',
      riskLevel: 'LOW',
      riskReason: 'Pedido dentro do prazo.',
      nextStep: 'Confirmar produção.',
      finalNotes: 'Entregar com etiqueta especial.',
      items: [
        {
          id: 'item_1',
          productId: 'product_1',
          productName: 'Calça jogger',
          position: 0,
          quantityMode: 'SINGLE',
          quantity: 34,
          sizes: [],
          stages: [],
          totalQuantity: 34
        }
      ],
      products: [{ name: 'Calça jogger', quantity: 34 }]
    }
  ]);

  updateOrderStatus = jest.fn((id: string, status: OrderStatus) => {
    const nextOrders = this.orders$.value.map((order) => (order.id === id ? { ...order, status } : order));
    const updatedOrder = nextOrders.find((order) => order.id === id)!;
    this.orders$.next(nextOrders);
    return of(updatedOrder);
  });
}

class ConfirmDialogServiceStub {
  open = jest.fn((config: { onConfirm?: () => void }) => config.onConfirm?.());
}

class ToastServiceStub {
  success = jest.fn();
  warning = jest.fn();
  danger = jest.fn();
}

describe('OrdersListPageComponent', () => {
  let fixture: ComponentFixture<OrdersListPageComponent>;
  let ordersService: OrdersServiceStub;

  beforeEach(async () => {
    ordersService = new OrdersServiceStub();

    await TestBed.configureTestingModule({
      imports: [OrdersListPageComponent],
      providers: [
        provideRouter([]),
        { provide: OrdersService, useValue: ordersService },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListPageComponent);
    fixture.detectChanges();
  });

  it('exibe a lista atual de pedidos', () => {
    const host = fixture.nativeElement as HTMLElement;
    const listItems = host.querySelectorAll('.orders-app__item');

    expect(listItems.length).toBe(2);
    expect(host.textContent).toContain('Cia. Aurora');
    expect(host.textContent).toContain('Pedido 2001');
    expect(host.textContent).toContain('2 pedidos');
    expect(listItems[0].textContent).toContain('Pedido 2001');
  });

  it('explica e destaca risco de atraso quando ordena por risco', () => {
    const host = fixture.nativeElement as HTMLElement;
    const sortSelect = host.querySelector<HTMLSelectElement>('select[formControlName="sort"]');

    sortSelect!.value = 'RISK';
    sortSelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const listItems = host.querySelectorAll('.orders-app__item');

    expect(host.textContent).toContain('Risco relevante de atraso.');
    expect(listItems[0].textContent).toContain('Pedido 2002');
    expect(listItems[0].querySelector('.orders-risk-badge--high')?.textContent).toContain('Alto');
    expect(listItems[0].classList).toContain('orders-list__item--attention');
  });

  it('abre um modal de ajuda ao clicar no icone de risco de atraso', () => {
    const host = fixture.nativeElement as HTMLElement;
    const helpButton = host.querySelector<HTMLButtonElement>('.orders-list__help-button');

    helpButton!.click();
    fixture.detectChanges();

    const modal = host.querySelector<HTMLElement>('.orders-list__help-panel');

    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Risco de atraso');
    expect(modal?.textContent).toContain('Mostra a chance de perder o prazo prometido.');
    expect(modal?.textContent).toContain('Crítico');
  });

  it('atualiza o status do pedido pela lista', () => {
    const host = fixture.nativeElement as HTMLElement;
    const triggers = host.querySelectorAll<HTMLButtonElement>('.orders-list__status-trigger');

    triggers[0].click();
    fixture.detectChanges();

    const actionButton = host.querySelector<HTMLButtonElement>('.orders-list__status-option');
    actionButton!.click();
    fixture.detectChanges();

    expect(ordersService.updateOrderStatus).toHaveBeenCalledWith('ORD-2001', 'IN_PROGRESS');
    expect(host.textContent).toContain('Em produção');
  });

  it('filtra pedidos por busca, situação e risco', () => {
    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector<HTMLInputElement>('input[formControlName="search"]');
    const riskSelect = host.querySelector<HTMLSelectElement>('select[formControlName="risk"]');

    searchInput!.value = 'aurora';
    searchInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.textContent).toContain('Pedido 2001');
    expect(host.textContent).not.toContain('Pedido 2002');
    expect(host.textContent).toContain('1 de 2 pedido');

    riskSelect!.value = 'HIGH';
    riskSelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.textContent).toContain('Nenhum pedido encontrado.');
    expect(host.textContent).toContain('Limpar filtros');
  });
});
