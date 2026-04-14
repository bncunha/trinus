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
    customerName: 'Alpha Uniforms',
    status: 'REGISTERED',
    startDate: '2026-04-08',
    deliveryDate: '2026-04-15',
    riskLevel: 'LOW',
    riskReason: 'Order is within the planned window.',
    nextStep: 'Confirm production requirements.',
    finalNotes: 'Pack separately.',
    products: [{ name: 'Polo shirt', quantity: 120 }]
  };

  const service = {
    findAll: jest.fn().mockReturnValue([order]),
    findById: jest.fn().mockReturnValue(order),
    create: jest.fn().mockImplementation((_: string, input: CreateOrderInput) => ({
      id: 'order_2',
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      status: input.status ?? 'REGISTERED',
      startDate: input.startDate ?? '2026-04-10',
      deliveryDate: input.deliveryDate ?? '2026-04-10',
      riskLevel: input.riskLevel ?? 'LOW',
      riskReason: input.riskReason ?? 'Order is waiting for an operational review.',
      nextStep: input.nextStep ?? 'Confirm order details.',
      finalNotes: input.finalNotes,
      products: input.products
    })),
    update: jest.fn().mockImplementation((_: string, id: string, input: Partial<CreateOrderInput>) => ({
      ...order,
      ...input,
      id
    }))
  } as unknown as jest.Mocked<OrdersService>;

  const controller = new OrdersController(service);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all orders', () => {
    expect(controller.getOrders(request)).toEqual([order]);
    expect(service.findAll).toHaveBeenCalledWith('company_1');
  });

  it('returns an order by id', () => {
    expect(controller.getOrderById(request, 'order_1')).toEqual(order);
    expect(service.findById).toHaveBeenCalledWith('company_1', 'order_1');
  });

  it('throws when order is not found', () => {
    service.findById.mockReturnValueOnce(null);

    expect(() => controller.getOrderById(request, 'missing')).toThrow(NotFoundException);
  });

  it('creates an order', () => {
    const input: CreateOrderInput = {
      orderNumber: '1003',
      customerName: 'Gamma Studio',
      products: [{ name: 'Cap', quantity: 40 }]
    };

    expect(controller.createOrder(request, input)).toMatchObject({
      orderNumber: '1003',
      customerName: 'Gamma Studio',
      status: 'REGISTERED'
    });
    expect(service.create).toHaveBeenCalledWith('company_1', input);
  });

  it('updates an order', () => {
    expect(controller.updateOrder(request, 'order_1', { customerName: 'Updated Customer' })).toMatchObject({
      id: 'order_1',
      customerName: 'Updated Customer'
    });
    expect(service.update).toHaveBeenCalledWith('company_1', 'order_1', { customerName: 'Updated Customer' });
  });

  it('throws when updating a missing order', () => {
    service.update.mockReturnValueOnce(null);

    expect(() => controller.updateOrder(request, 'missing', { customerName: 'Updated Customer' })).toThrow(NotFoundException);
  });
});
