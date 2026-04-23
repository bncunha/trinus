import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { CreateOrderInput, Order } from '@trinus/contracts';
import { of, throwError } from 'rxjs';
import { OrdersService } from './orders.service';

const order: Order = {
  id: 'ORD-3001',
  orderNumber: '3001',
  customerId: 'customer_1',
  customerName: 'Malharia Norte',
  status: 'REGISTERED',
  startDate: '2026-04-09',
  deliveryDate: '2026-04-19',
  riskLevel: 'LOW',
  riskReason: 'Pedido dentro do prazo.',
  nextStep: 'Iniciar etapa Corte.',
  items: [
    {
      id: 'item_1',
      productId: 'product_1',
      productName: 'Jaqueta corta-vento',
      position: 0,
      quantityMode: 'SINGLE',
      quantity: 20,
      sizes: [],
      stages: [],
      totalQuantity: 20
    }
  ],
  products: [{ name: 'Jaqueta corta-vento', quantity: 20 }]
};

describe('OrdersService', () => {
  const httpMock = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [OrdersService, { provide: HttpClient, useValue: httpMock }]
    });
  });

  it('loads orders from the authenticated API', (done) => {
    httpMock.get.mockReturnValue(of([order]));

    const service = TestBed.inject(OrdersService);

    service.loadOrders().subscribe((orders) => {
      expect(orders).toEqual([order]);
      expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/orders', { withCredentials: true });
      done();
    });
  });

  it('does not persist locally when loading fails', (done) => {
    httpMock.get.mockReturnValue(throwError(() => new Error('offline')));

    const service = TestBed.inject(OrdersService);

    service.loadOrders().subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        done();
      }
    });
  });

  it('creates orders through the authenticated API only', (done) => {
    const request: CreateOrderInput = {
      orderNumber: 'ALF-220',
      customerId: 'customer_1',
      startDate: '2026-04-14',
      deliveryDate: '2026-04-28',
      items: [{ productId: 'product_1', quantityMode: 'SINGLE', quantity: 55 }]
    };
    const response: Order = {
      ...order,
      ...request,
      id: 'ORD-3002',
      customerName: 'Ateliê Alfa',
      items: [
        {
          id: 'item_2',
          productId: 'product_1',
          productName: 'Camiseta manga longa',
          position: 0,
          quantityMode: 'SINGLE',
          quantity: 55,
          sizes: [],
          stages: [],
          totalQuantity: 55
        }
      ],
      products: [{ name: 'Camiseta manga longa', quantity: 55 }]
    };

    httpMock.post.mockReturnValue(of(response));

    const service = TestBed.inject(OrdersService);

    service.createOrder(request).subscribe((createdOrder) => {
      expect(createdOrder).toEqual(response);
      expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/orders', request, { withCredentials: true });
      done();
    });
  });
});
