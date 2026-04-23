import { NotFoundException } from '@nestjs/common';
import type { CreateOrderInput, Order } from '@trinus/contracts';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  const request = {
    auth: {
      user: {
        id: 'user_1',
        companyId: 'company_1',
        name: 'Admin',
        email: 'admin@trinus.test',
        role: 'ADMIN',
        isActive: true
      },
      company: {
        id: 'company_1',
        name: 'Trinus Test'
      }
    }
  } as never;

  const order: Order = {
    id: 'order_1',
    orderNumber: '1001',
    customerId: 'customer_1',
    customerName: 'Alpha Uniforms',
    status: 'REGISTERED',
    startDate: '2026-04-08',
    deliveryDate: '2026-04-15',
    riskLevel: 'LOW',
    riskReason: 'Pedido aguardando cálculo de risco.',
    nextStep: 'Definir etapas de produção.',
    finalNotes: 'Pack separately.',
    items: [
      {
        id: 'item_1',
        productId: 'product_1',
        productName: 'Polo shirt',
        position: 0,
        quantityMode: 'SINGLE',
        quantity: 120,
        sizes: [],
        stages: [],
        totalQuantity: 120
      }
    ],
    products: [{ name: 'Polo shirt', quantity: 120 }]
  };

  const service = {
    findAll: jest.fn().mockResolvedValue([order]),
    findById: jest.fn().mockResolvedValue(order),
    create: jest.fn().mockImplementation((_: string, input: CreateOrderInput) =>
      Promise.resolve({
        ...order,
        id: 'order_2',
        ...input,
        customerName: 'Alpha Uniforms'
      })
    ),
    update: jest.fn().mockImplementation((_: string, id: string, input: Partial<CreateOrderInput>) =>
      Promise.resolve({
        ...order,
        ...input,
        id
      })
    )
  } as unknown as jest.Mocked<OrdersService>;

  const controller = new OrdersController(service);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all orders', async () => {
    await expect(controller.getOrders(request)).resolves.toEqual([order]);
    expect(service.findAll).toHaveBeenCalledWith('company_1');
  });

  it('returns an order by id', async () => {
    await expect(controller.getOrderById(request, 'order_1')).resolves.toEqual(order);
    expect(service.findById).toHaveBeenCalledWith('company_1', 'order_1');
  });

  it('throws when order is not found', async () => {
    service.findById.mockResolvedValueOnce(null);

    await expect(controller.getOrderById(request, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('creates an order', async () => {
    const input: CreateOrderInput = {
      orderNumber: '1003',
      customerId: 'customer_1',
      items: [{ productId: 'product_1', quantityMode: 'SINGLE', quantity: 40 }]
    };

    await expect(controller.createOrder(request, input)).resolves.toMatchObject({
      orderNumber: '1003',
      customerId: 'customer_1',
      status: 'REGISTERED'
    });
    expect(service.create).toHaveBeenCalledWith('company_1', input);
  });

  it('updates an order', async () => {
    await expect(controller.updateOrder(request, 'order_1', { orderNumber: '1001-A' })).resolves.toMatchObject({
      id: 'order_1',
      orderNumber: '1001-A'
    });
    expect(service.update).toHaveBeenCalledWith('company_1', 'order_1', { orderNumber: '1001-A' });
  });

  it('throws when updating a missing order', async () => {
    service.update.mockResolvedValueOnce(null);

    await expect(controller.updateOrder(request, 'missing', { orderNumber: '1001-A' })).rejects.toThrow(NotFoundException);
  });
});
