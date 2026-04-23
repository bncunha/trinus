import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import type { CreateOrderInput, Order } from '@trinus/contracts';
import { of, throwError } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { OrdersService } from '../../../services-api/orders.service';
import { ToastService } from '../../../shared/toast.service';
import { OrderFormPageComponent } from './order-form-page.component';

const order: Order = {
  id: 'ORD-2001',
  orderNumber: '2001',
  customerId: 'customer_1',
  customerName: 'Cia. Aurora',
  status: 'REGISTERED',
  startDate: '2026-04-09',
  deliveryDate: '2026-04-16',
  riskLevel: 'LOW',
  riskReason: 'Pedido dentro do prazo.',
  nextStep: 'Iniciar etapa Corte.',
  finalNotes: 'Entregar com etiqueta especial.',
  items: [
    {
      id: 'item_1',
      productId: 'product_1',
      productName: 'Calça jogger',
      templateId: 'template_1',
      templateName: 'Fluxo padrão',
      position: 0,
      quantityMode: 'SINGLE',
      quantity: 34,
      sizes: [],
      stages: [{ id: 'stage_item_1', stageId: 'stage_1', stageName: 'Corte', position: 0 }],
      totalQuantity: 34
    }
  ],
  products: [{ name: 'Calça jogger', quantity: 34 }]
};

class OrdersServiceStub {
  getOrder = jest.fn(() => of(order));
  createOrder = jest.fn((request: CreateOrderInput) => of({ ...order, ...request, id: 'ORD-2002' }));
  updateOrder = jest.fn((_: string, request: Partial<CreateOrderInput>) => of({ ...order, ...request }));
}

class MasterDataServiceStub {
  listCustomers = jest.fn(() => of([{ id: 'customer_1', name: 'Cia. Aurora', isActive: true }]));
  listProducts = jest.fn(() => of([{ id: 'product_1', name: 'Calça jogger', costPrice: 10, salePrice: 20, isActive: true, variableDefaults: [] }]));
  listSizes = jest.fn(() => of([{ id: 'size_p', name: 'P', position: 1, isActive: true }, { id: 'size_m', name: 'M', position: 2, isActive: true }]));
  listStages = jest.fn(() => of([{ id: 'stage_1', name: 'Corte', sectorId: 'sector_1', measurementUnitId: 'unit_1', capacityPerWorkday: 10, position: 0, isActive: true }]));
  listTemplates = jest.fn(() => of([{ id: 'template_1', name: 'Fluxo padrão', isActive: true, items: [{ id: 'template_item_1', stageId: 'stage_1', position: 0 }] }]));
  createCustomer = jest.fn();
  createProduct = jest.fn();
}

class ToastServiceStub {
  success = jest.fn();
}

describe('OrderFormPageComponent', () => {
  let fixture: ComponentFixture<OrderFormPageComponent>;
  let ordersService: OrdersServiceStub;
  let router: Router;

  beforeEach(async () => {
    ordersService = new OrdersServiceStub();

    await TestBed.configureTestingModule({
      imports: [OrderFormPageComponent],
      providers: [
        provideRouter([]),
        { provide: OrdersService, useValue: ordersService },
        { provide: MasterDataService, useClass: MasterDataServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(OrderFormPageComponent);
    fixture.detectChanges();
  });

  it('salva pedido com cliente, produto e quantidade única', () => {
    const component = fixture.componentInstance as unknown as {
      orderForm: typeof fixture.componentInstance extends never ? never : any;
      saveOrder: () => void;
    };

    component.orderForm.patchValue({
      customerId: 'customer_1',
      orderNumber: 'PED-2040',
      startDate: '2026-04-12',
      deliveryDate: '2026-04-24',
      finalNotes: 'Separar por tamanho.'
    });
    component.orderForm.controls.items.at(0).patchValue({
      productId: 'product_1',
      quantityMode: 'SINGLE',
      quantity: 80.25,
      templateId: 'template_1'
    });
    component.saveOrder();

    expect(ordersService.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: 'customer_1',
        orderNumber: 'PED-2040',
        items: [expect.objectContaining({ productId: 'product_1', quantity: 80.25, quantityMode: 'SINGLE' })]
      })
    );
    expect(TestBed.inject(ToastService).success).toHaveBeenCalledWith('Pedido salvo', 'Pedido salvo com sucesso.');
  });

  it('rejeita item sem quantidade válida antes de chamar API', () => {
    const component = fixture.componentInstance as unknown as { orderForm: any; saveOrder: () => void; errorMessage: string };

    component.orderForm.patchValue({ customerId: 'customer_1', orderNumber: 'PED-2040' });
    component.orderForm.controls.items.at(0).patchValue({ productId: 'product_1', quantityMode: 'SINGLE', quantity: 0 });
    component.saveOrder();

    expect(ordersService.createOrder).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Corrija os campos destacados');
  });

  it('exibe erro quando a API falha', () => {
    ordersService.createOrder.mockReturnValueOnce(throwError(() => new Error('api indisponível')));
    const component = fixture.componentInstance as unknown as { orderForm: any; saveOrder: () => void; errorMessage: string };

    component.orderForm.patchValue({ customerId: 'customer_1', orderNumber: 'PED-2040' });
    component.orderForm.controls.items.at(0).patchValue({ productId: 'product_1', quantityMode: 'SINGLE', quantity: 12 });
    component.saveOrder();

    expect(component.errorMessage).toContain('Não foi possível salvar o pedido.');
  });
});
