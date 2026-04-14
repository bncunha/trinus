import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { CreateOrderInput, Order } from '@trinus/contracts';
import { of, throwError } from 'rxjs';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const httpMock = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [OrdersService, { provide: HttpClient, useValue: httpMock }]
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('loads orders from the authenticated API', (done) => {
    const order: Order = {
      id: 'ORD-3001',
      orderNumber: '3001',
      customerName: 'Malharia Norte',
      status: 'REGISTERED',
      startDate: '2026-04-09',
      deliveryDate: '2026-04-19',
      riskLevel: 'LOW',
      riskReason: 'Pedido dentro do prazo.',
      nextStep: 'Confirmar produção.',
      products: [{ name: 'Jaqueta corta-vento', quantity: 20 }]
    };

    httpMock.get.mockReturnValue(of([order]));

    const service = TestBed.inject(OrdersService);

    service.loadOrders().subscribe((orders) => {
      expect(orders).toEqual([order]);
      expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/orders', { withCredentials: true });
      expect(localStorage.getItem('trinus-web.orders')).toBeNull();
      done();
    });
  });

  it('does not persist locally when loading fails', (done) => {
    httpMock.get.mockReturnValue(throwError(() => new Error('offline')));

    const service = TestBed.inject(OrdersService);

    service.loadOrders().subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(localStorage.getItem('trinus-web.orders')).toBeNull();
        done();
      }
    });
  });

  it('creates orders through the authenticated API only', (done) => {
    const request: CreateOrderInput = {
      orderNumber: 'ALF-220',
      customerName: 'Ateliê Alfa',
      startDate: '2026-04-14',
      deliveryDate: '2026-04-28',
      products: [{ name: 'Camiseta manga longa', quantity: 55 }]
    };
    const response: Order = {
      ...request,
      id: 'ORD-3002',
      status: 'REGISTERED',
      startDate: request.startDate ?? '2026-04-14',
      deliveryDate: request.deliveryDate ?? '2026-04-28',
      riskLevel: 'LOW',
      riskReason: 'Pedido aguardando análise operacional.',
      nextStep: 'Confirmar detalhes do pedido.'
    };

    httpMock.post.mockReturnValue(of(response));

    const service = TestBed.inject(OrdersService);

    service.createOrder(request).subscribe((order) => {
      expect(order).toEqual(response);
      expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/orders', request, { withCredentials: true });
      expect(localStorage.getItem('trinus-web.orders')).toBeNull();
      done();
    });
  });
});
