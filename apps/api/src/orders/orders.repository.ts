import { Injectable } from '@nestjs/common';
import type { Order } from '@trinus/contracts';

type StoredOrder = Order & {
  companyId: string;
};

export abstract class OrdersRepository {
  abstract findAll(companyId: string): Order[];
  abstract findById(companyId: string, id: string): Order | null;
  abstract save(companyId: string, order: Order): Order;
  abstract update(companyId: string, id: string, order: Order): Order | null;
}

const cloneOrder = (order: StoredOrder): Order => {
  const { companyId: _companyId, ...publicOrder } = order;

  return {
    ...publicOrder,
    products: order.products.map((product: Order['products'][number]) => ({ ...product }))
  };
};

@Injectable()
export class InMemoryOrdersRepository extends OrdersRepository {
  private readonly orders: StoredOrder[] = [
    {
      id: 'order_1',
      companyId: 'demo_company',
      orderNumber: '1001',
      customerName: 'Alpha Uniforms',
      status: 'REGISTERED',
      startDate: '2026-04-08',
      deliveryDate: '2026-04-15',
      riskLevel: 'LOW',
      riskReason: 'Order is within the planned window.',
      nextStep: 'Confirm production requirements.',
      products: [{ name: 'Polo shirt', quantity: 120 }]
    },
    {
      id: 'order_2',
      companyId: 'demo_company',
      orderNumber: '1002',
      customerName: 'Beta Sports',
      status: 'IN_PROGRESS',
      startDate: '2026-04-06',
      deliveryDate: '2026-04-18',
      riskLevel: 'MEDIUM',
      riskReason: 'Queue load is above the expected daily capacity.',
      nextStep: 'Review queue impact with the production team.',
      products: [
        { name: 'T-shirt', quantity: 250 },
        { name: 'Hoodie', quantity: 60 }
      ]
    }
  ];

  findAll(companyId: string): Order[] {
    return this.orders.filter((order) => order.companyId === companyId).map(cloneOrder);
  }

  findById(companyId: string, id: string): Order | null {
    const order = this.orders.find((item) => item.companyId === companyId && item.id === id);

    return order ? cloneOrder(order) : null;
  }

  save(companyId: string, order: Order): Order {
    const storedOrder: StoredOrder = { ...order, companyId, products: order.products.map((product) => ({ ...product })) };
    this.orders.push(storedOrder);

    return cloneOrder(storedOrder);
  }

  update(companyId: string, id: string, order: Order): Order | null {
    const orderIndex = this.orders.findIndex((item) => item.companyId === companyId && item.id === id);

    if (orderIndex === -1) {
      return null;
    }

    const storedOrder: StoredOrder = {
      ...order,
      id,
      companyId,
      products: order.products.map((product) => ({ ...product }))
    };
    this.orders[orderIndex] = storedOrder;

    return cloneOrder(storedOrder);
  }
}
