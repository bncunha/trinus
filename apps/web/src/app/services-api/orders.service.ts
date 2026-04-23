import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import type { CreateOrderInput, Order, OrderStatus, UpdateOrderInput } from '@trinus/contracts';
import { getApiBaseUrl } from './api-url';

const ordersApiUrl = () => `${getApiBaseUrl()}/orders`;

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly ordersSubject = new BehaviorSubject<Order[]>([]);

  readonly orders$ = this.ordersSubject.asObservable();

  loadOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(ordersApiUrl(), { withCredentials: true }).pipe(map((orders) => this.persistOrders(orders)));
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${ordersApiUrl()}/${id}`, { withCredentials: true }).pipe(map((order) => this.persistOrder(order)));
  }

  createOrder(request: CreateOrderInput): Observable<Order> {
    return this.http.post<Order>(ordersApiUrl(), request, { withCredentials: true }).pipe(map((order) => this.persistOrder(order)));
  }

  updateOrder(id: string, request: UpdateOrderInput): Observable<Order> {
    return this.http.patch<Order>(`${ordersApiUrl()}/${id}`, request, { withCredentials: true }).pipe(map((order) => this.persistOrder(order)));
  }

  resetOrders(): void {
    this.ordersSubject.next([]);
  }

  private persistOrders(orders: ReadonlyArray<Order>): Order[] {
    const normalizedOrders = this.sortOrders(orders.map((order) => this.normalizeOrder(order)));

    this.ordersSubject.next(normalizedOrders);

    return normalizedOrders;
  }

  private persistOrder(order: Order): Order {
    const currentOrders = this.ordersSubject.value.filter((item) => item.id !== order.id);
    const normalizedOrder = this.normalizeOrder(order);
    const nextOrders = this.sortOrders([...currentOrders, normalizedOrder]);

    this.ordersSubject.next(nextOrders);

    return normalizedOrder;
  }

  private normalizeOrder(order: Order): Order {
    const items = (order.items ?? []).map((item) => ({
      ...item,
      quantity: item.quantity === undefined ? undefined : Number(item.quantity),
      sizes: (item.sizes ?? []).map((size) => ({ ...size, quantity: Number(size.quantity) })),
      stages: item.stages ?? [],
      totalQuantity:
        item.quantityMode === 'SINGLE'
          ? Number(item.quantity ?? 0)
          : (item.sizes ?? []).reduce((sum, size) => sum + Number(size.quantity), 0)
    }));

    return {
      ...order,
      orderNumber: order.orderNumber?.trim() ?? '',
      customerName: order.customerName?.trim() ?? '',
      startDate: order.startDate ?? '',
      deliveryDate: order.deliveryDate ?? '',
      status: this.normalizeStatus(order.status),
      riskLevel: order.riskLevel ?? 'LOW',
      riskReason: order.riskReason?.trim() ?? 'Pedido aguardando cálculo de risco.',
      nextStep: order.nextStep?.trim() ?? 'Definir etapas de produção.',
      finalNotes: order.finalNotes?.trim() || undefined,
      items,
      products: items.map((item) => ({ name: item.productName, quantity: item.totalQuantity }))
    };
  }

  private normalizeStatus(status: OrderStatus | undefined): OrderStatus {
    if (status === 'IN_PROGRESS' || status === 'PAUSED' || status === 'CANCELED' || status === 'FINISHED') {
      return status;
    }

    return 'REGISTERED';
  }

  private sortOrders(orders: ReadonlyArray<Order>): Order[] {
    return [...orders].sort((left, right) => {
      const deliveryCompare = (left.deliveryDate || '9999-12-31').localeCompare(right.deliveryDate || '9999-12-31');
      return deliveryCompare || right.orderNumber.localeCompare(left.orderNumber);
    });
  }
}
