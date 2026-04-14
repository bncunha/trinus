import type { Order } from '@trinus/contracts';
import { InMemoryOrdersRepository } from './orders.repository';

describe('InMemoryOrdersRepository', () => {
  const buildOrder = (id: string, orderNumber: string): Order => ({
    id,
    orderNumber,
    customerName: 'Cliente',
    status: 'REGISTERED',
    startDate: '2026-04-10',
    deliveryDate: '2026-04-20',
    riskLevel: 'LOW',
    riskReason: 'Pedido aguardando analise operacional.',
    nextStep: 'Confirmar detalhes do pedido.',
    products: [{ name: 'Camiseta', quantity: 10 }]
  });

  it('isolates orders by company', () => {
    const repository = new InMemoryOrdersRepository();

    repository.save('company_a', buildOrder('order_a', 'A-1'));
    repository.save('company_b', buildOrder('order_b', 'B-1'));

    expect(repository.findAll('company_a').map((order) => order.id)).toContain('order_a');
    expect(repository.findAll('company_a').map((order) => order.id)).not.toContain('order_b');
    expect(repository.findById('company_b', 'order_a')).toBeNull();
  });
});

