import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Order } from '@trinus/contracts';
import { map } from 'rxjs';
import { OrdersService } from '../../services-api/orders.service';
import {
  formatDate,
  getAttentionOrderCount,
  getNextDeliveryText,
  getOpenOrderCount,
  getStatusLabel,
  trackByOrderId
} from './orders-presenters';

@Component({
  selector: 'app-orders-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink],
  templateUrl: './orders-dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersDashboardPageComponent {
  private readonly ordersService = inject(OrdersService);

  protected readonly orders$ = this.ordersService.orders$;
  protected readonly viewModel$ = this.ordersService.orders$.pipe(
    map((orders) => ({
      attentionOrderCount: getAttentionOrderCount(orders),
      nextDeliveryText: getNextDeliveryText(orders),
      openOrderCount: getOpenOrderCount(orders),
      orders,
      recentOrders: orders.slice(0, 5)
    }))
  );
  protected readonly formatDate = formatDate;
  protected readonly getStatusLabel = getStatusLabel;
  protected readonly trackByOrderId = trackByOrderId;

  protected hasRecentOrders(orders: ReadonlyArray<Order>): boolean {
    return orders.length > 0;
  }
}
