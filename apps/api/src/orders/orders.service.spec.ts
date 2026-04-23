import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

const orderRecord = {
  id: 'order_1',
  companyId: 'company_1',
  customerId: 'customer_1',
  orderNumber: '1001',
  status: 'REGISTERED',
  startDate: new Date('2026-04-08T00:00:00'),
  deliveryDate: new Date('2026-04-15T00:00:00'),
  finalNotes: 'Separar por tamanho.',
  createdAt: new Date('2026-04-01T00:00:00'),
  updatedAt: new Date('2026-04-01T00:00:00'),
  customer: { id: 'customer_1', companyId: 'company_1', name: 'Alpha Uniforms', cpf: null, cnpj: null, address: null, mobilePhone: null, landlinePhone: null, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  items: [
    {
      id: 'item_1',
      orderId: 'order_1',
      productId: 'product_1',
      templateId: null,
      position: 0,
      quantityMode: 'SINGLE',
      quantity: 120,
      notes: null,
      product: { id: 'product_1', companyId: 'company_1', name: 'Polo shirt', costPrice: 10, salePrice: 20, isActive: true, createdAt: new Date(), updatedAt: new Date() },
      template: null,
      sizes: [],
      stages: []
    }
  ]
};

describe('OrdersService', () => {
  const prisma = {
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn()
    },
    customer: {
      findFirst: jest.fn()
    },
    product: {
      findFirst: jest.fn()
    },
    clothingSize: {
      findMany: jest.fn()
    },
    template: {
      findFirst: jest.fn()
    },
    stage: {
      findMany: jest.fn()
    },
    $transaction: jest.fn()
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.order.findMany.mockResolvedValue([orderRecord]);
    prisma.order.findFirst.mockResolvedValue(orderRecord);
    prisma.customer.findFirst.mockResolvedValue({ id: 'customer_1' });
    prisma.product.findFirst.mockResolvedValue({ id: 'product_1' });
    prisma.clothingSize.findMany.mockResolvedValue([{ id: 'size_p' }]);
    prisma.template.findFirst.mockResolvedValue(null);
    prisma.stage.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        order: {
          create: jest.fn().mockResolvedValue({ id: 'order_2' }),
          update: jest.fn().mockResolvedValue({ id: 'order_1' }),
          findFirst: jest.fn().mockResolvedValue({ ...orderRecord, id: 'order_2', orderNumber: '1002' })
        },
        orderItem: {
          create: jest.fn().mockResolvedValue({ id: 'item_2' }),
          deleteMany: jest.fn().mockResolvedValue({ count: 1 })
        },
        orderItemSize: {
          createMany: jest.fn().mockResolvedValue({ count: 0 })
        },
        orderItemStage: {
          createMany: jest.fn().mockResolvedValue({ count: 0 })
        }
      })
    );
    service = new OrdersService(prisma as never);
  });

  it('lists orders mapped from Prisma', async () => {
    await expect(service.findAll('company_1')).resolves.toEqual([
      expect.objectContaining({
        id: 'order_1',
        customerId: 'customer_1',
        customerName: 'Alpha Uniforms',
        products: [{ name: 'Polo shirt', quantity: 120 }]
      })
    ]);
    expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: 'company_1' } }));
  });

  it('creates an order with a valid item', async () => {
    await expect(
      service.create('company_1', {
        orderNumber: '1002',
        customerId: 'customer_1',
        items: [{ productId: 'product_1', quantityMode: 'SINGLE', quantity: 40 }]
      })
    ).resolves.toMatchObject({
      id: 'order_2',
      orderNumber: '1002',
      customerId: 'customer_1'
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects quantity with more than two decimal places', async () => {
    await expect(
      service.create('company_1', {
        orderNumber: '1003',
        customerId: 'customer_1',
        items: [{ productId: 'product_1', quantityMode: 'SINGLE', quantity: 1.234 }]
      })
    ).rejects.toThrow(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a customer from another company', async () => {
    prisma.customer.findFirst.mockResolvedValueOnce(null);

    await expect(
      service.create('company_1', {
        orderNumber: '1003',
        customerId: 'customer_other',
        items: [{ productId: 'product_1', quantityMode: 'SINGLE', quantity: 12 }]
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('returns null when updating a missing order', async () => {
    prisma.order.findFirst.mockResolvedValueOnce(null);

    await expect(service.update('company_1', 'missing', { orderNumber: '1001-A' })).resolves.toBeNull();
  });
});
