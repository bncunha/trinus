import { BadRequestException } from '@nestjs/common';
import type { CreateOrderInput, Order } from '@trinus/contracts';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const companyId = 'company_1';
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

  const repository: jest.Mocked<OrdersRepository> = {
    findAll: jest.fn().mockReturnValue([order]),
    findById: jest.fn().mockImplementation((_: string, id: string) => (id === order.id ? order : null)),
    save: jest.fn().mockImplementation((_: string, value: Order) => value),
    update: jest.fn().mockImplementation((_: string, __: string, value: Order) => value)
  };

  const service = new OrdersService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists orders', () => {
    expect(service.findAll(companyId)).toEqual([order]);
    expect(repository.findAll).toHaveBeenCalledWith(companyId);
  });

  it('finds an order by id', () => {
    expect(service.findById(companyId, 'order_1')).toEqual(order);
    expect(repository.findById).toHaveBeenCalledWith(companyId, 'order_1');
  });

  it('creates an order with defaults', () => {
    const input: CreateOrderInput = {
      orderNumber: '1003',
      customerName: 'Gamma Studio',
      finalNotes: 'Deliver after 2 PM.',
      products: [{ name: 'Cap', quantity: 40.25 }]
    };

    const created = service.create(companyId, input);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(created).toMatchObject({
      orderNumber: '1003',
      customerName: 'Gamma Studio',
      status: 'REGISTERED',
      riskLevel: 'LOW',
      riskReason: 'Order is waiting for an operational review.',
      nextStep: 'Confirm order details.',
      finalNotes: 'Deliver after 2 PM.',
      products: [{ name: 'Cap', quantity: 40.25 }]
    });
    expect(created.id).toEqual(expect.any(String));
    expect(created.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(created.deliveryDate).toEqual(created.startDate);
  });

  it('updates an existing order', () => {
    const updated = service.update(companyId, 'order_1', {
      customerName: 'Updated Customer',
      finalNotes: 'Updated notes.',
      products: [{ name: 'Updated item', quantity: 12 }]
    });

    expect(repository.update).toHaveBeenCalledWith(
      companyId,
      'order_1',
      expect.objectContaining({
        id: 'order_1',
        orderNumber: '1001',
        customerName: 'Updated Customer',
        finalNotes: 'Updated notes.',
        products: [{ name: 'Updated item', quantity: 12 }]
      })
    );
    expect(updated).toMatchObject({
      id: 'order_1',
      customerName: 'Updated Customer'
    });
  });

  it('rejects product quantity with more than two decimal places', () => {
    const input: CreateOrderInput = {
      orderNumber: '1003',
      customerName: 'Gamma Studio',
      products: [{ name: 'Cap', quantity: 1.234 }]
    };

    expect(() => service.create(companyId, input)).toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects product quantity less than or equal to zero', () => {
    const input: CreateOrderInput = {
      orderNumber: '1003',
      customerName: 'Gamma Studio',
      products: [{ name: 'Cap', quantity: 0 }]
    };

    expect(() => service.create(companyId, input)).toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('returns null when updating a missing order', () => {
    expect(service.update(companyId, 'missing', { customerName: 'Updated Customer' })).toBeNull();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
