import { getAllowedNextOrderStatuses, type Order, type OrderStatus, type RiskLevel } from '@trinus/contracts';

const STATUS_LABELS: Record<OrderStatus, string> = {
  REGISTERED: 'Registrado',
  IN_PROGRESS: 'Em produção',
  PAUSED: 'Pausado',
  CANCELED: 'Cancelado',
  FINISHED: 'Finalizado'
};

const STATUS_ACTION_LABELS: Record<OrderStatus, string> = {
  REGISTERED: 'Marcar como registrado',
  IN_PROGRESS: 'Marcar como em andamento',
  PAUSED: 'Pausar pedido',
  CANCELED: 'Cancelar pedido',
  FINISHED: 'Finalizar pedido'
};

const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
};

const RISK_DESCRIPTIONS: Record<RiskLevel, string> = {
  LOW: 'Sem sinal relevante de atraso.',
  MEDIUM: 'Atenção, monitorar o pedido.',
  HIGH: 'Risco relevante de atraso.',
  CRITICAL: 'Atraso muito provável ou iminente.'
};

const RISK_SORT_PRIORITY: Record<RiskLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
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

export function getStatusActionLabel(status: OrderStatus): string {
  return STATUS_ACTION_LABELS[status];
}

export function getStatusBadgeClass(status: OrderStatus): string {
  return `orders-status-badge--${status.toLowerCase()}`;
}

export function getNextStatusOptions(status: OrderStatus): Array<{ value: OrderStatus; label: string; actionLabel: string }> {
  return getAllowedNextOrderStatuses(status).map((nextStatus) => ({
    value: nextStatus,
    label: getStatusLabel(nextStatus),
    actionLabel: getStatusActionLabel(nextStatus)
  }));
}

export function getRiskLabel(riskLevel: RiskLevel): string {
  return RISK_LABELS[riskLevel];
}

export function getRiskDescription(riskLevel: RiskLevel): string {
  return RISK_DESCRIPTIONS[riskLevel];
}

export function getRiskBadgeClass(riskLevel: RiskLevel): string {
  return `orders-risk-badge--${riskLevel.toLowerCase()}`;
}

export function sortOrdersByRisk(orders: ReadonlyArray<Order>): Order[] {
  return [...orders].sort((left, right) => {
    const riskCompare = RISK_SORT_PRIORITY[left.riskLevel] - RISK_SORT_PRIORITY[right.riskLevel];

    if (riskCompare !== 0) {
      return riskCompare;
    }

    return (left.deliveryDate || '9999-12-31').localeCompare(right.deliveryDate || '9999-12-31');
  });
}

export function trackByOrderId(_: number, order: Order): string {
  return order.id;
}
