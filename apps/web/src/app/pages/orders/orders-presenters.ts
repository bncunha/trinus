import type { Order, OrderStatus, RiskLevel } from '@trinus/contracts';

const STATUS_LABELS: Record<OrderStatus, string> = {
  REGISTERED: 'Registrado',
  IN_PROGRESS: 'Em produção',
  PAUSED: 'Pausado',
  CANCELED: 'Cancelado',
  FINISHED: 'Finalizado'
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
};

export function formatDate(dateValue: string): string {
  if (!dateValue) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(`${dateValue}T00:00:00`));
}

export function getOpenOrderCount(orders: ReadonlyArray<Order>): number {
  return orders.filter((order) => order.status !== 'CANCELED' && order.status !== 'FINISHED').length;
}

export function getAttentionOrderCount(orders: ReadonlyArray<Order>): number {
  return orders.filter((order) => order.riskLevel === 'HIGH' || order.riskLevel === 'CRITICAL').length;
}

export function getNextDeliveryText(orders: ReadonlyArray<Order>): string {
  const nextOrder = orders
    .filter((order) => order.status !== 'CANCELED' && order.status !== 'FINISHED')
    .sort((left, right) => left.deliveryDate.localeCompare(right.deliveryDate))[0];

  if (!nextOrder) {
    return 'Sem entregas abertas';
  }

  return `${formatDate(nextOrder.deliveryDate)} - ${nextOrder.customerName}`;
}

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

export function getRiskLabel(riskLevel: RiskLevel): string {
  return RISK_LABELS[riskLevel];
}

export function trackByOrderId(_: number, order: Order): string {
  return order.id;
}
