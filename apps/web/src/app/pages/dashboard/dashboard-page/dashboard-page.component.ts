import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { OrdersService } from '../../../services-api/orders.service';
import { getOpenOrderCount } from '../../orders/orders-presenters';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, CommonModule, RouterLink],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {
  private readonly ordersService = inject(OrdersService);

  protected readonly openOrderCount$ = this.ordersService.orders$.pipe(map((orders) => getOpenOrderCount(orders)));
}
