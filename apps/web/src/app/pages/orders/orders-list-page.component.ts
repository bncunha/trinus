import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdersService } from '../../services-api/orders.service';
import { formatDate, getRiskLabel, getStatusLabel, trackByOrderId } from './orders-presenters';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink],
  templateUrl: './orders-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListPageComponent {
  private readonly ordersService = inject(OrdersService);

  protected readonly orders$ = this.ordersService.orders$;
  protected readonly formatDate = formatDate;
  protected readonly getRiskLabel = getRiskLabel;
  protected readonly getStatusLabel = getStatusLabel;
  protected readonly trackByOrderId = trackByOrderId;
}
