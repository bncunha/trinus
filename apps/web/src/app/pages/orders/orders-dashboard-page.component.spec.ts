import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Order } from '@trinus/contracts';
import { BehaviorSubject } from 'rxjs';
import { OrdersService } from '../../services-api/orders.service';
import { OrdersDashboardPageComponent } from './orders-dashboard-page.component';

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
      products: [{ name: 'Calça jogger', quantity: 34 }]
    }
  ]);
}

describe('OrdersDashboardPageComponent', () => {
  let fixture: ComponentFixture<OrdersDashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersDashboardPageComponent],
      providers: [provideRouter([]), { provide: OrdersService, useClass: OrdersServiceStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersDashboardPageComponent);
    fixture.detectChanges();
  });

  it('exibe resumo e últimos pedidos', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Pedidos totais');
    expect(host.textContent).toContain('Em aberto');
    expect(host.textContent).toContain('Cia. Aurora');
    expect(host.textContent).toContain('Ver lista');
    expect(host.textContent).toContain('Novo pedido');
  });
});
