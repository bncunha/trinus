import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Order } from '@trinus/contracts';
import { BehaviorSubject } from 'rxjs';
import { OrdersService } from '../../../services-api/orders.service';
import { OrdersListPageComponent } from './orders-list-page.component';

class OrdersServiceStub {
  readonly orders$ = new BehaviorSubject<Order[]>([
    {
      id: 'ORD-2001',
      orderNumber: '2001',
      customerId: 'customer_1',
      customerName: 'Cia. Aurora',
      status: 'REGISTERED',
      startDate: '2026-04-09',
      deliveryDate: '2026-04-16',
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
}

describe('OrdersListPageComponent', () => {
  let fixture: ComponentFixture<OrdersListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersListPageComponent],
      providers: [provideRouter([]), { provide: OrdersService, useClass: OrdersServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersListPageComponent);
    fixture.detectChanges();
  });

  it('exibe a lista atual de pedidos', () => {
    const host = fixture.nativeElement as HTMLElement;
    const listItems = host.querySelectorAll('.orders-app__item');

    expect(listItems.length).toBe(1);
    expect(host.textContent).toContain('Cia. Aurora');
    expect(host.textContent).toContain('Pedido 2001');
  });
});
