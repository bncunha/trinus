import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Order, OrderStatus, RiskLevel } from '@trinus/contracts';
import { combineLatest, map, startWith } from 'rxjs';
import { OrdersService } from '../../../services-api/orders.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog.service';
import { ToastService } from '../../../shared/toast.service';
import {
  formatDate,
  getNextStatusOptions,
  getRiskBadgeClass,
  getRiskDescription,
  getRiskLabel,
  getStatusActionLabel,
  getStatusBadgeClass,
  getStatusLabel,
  sortOrdersByRisk,
  trackByOrderId
} from '../orders-presenters';

type OrderStatusFilter = 'ALL' | OrderStatus;
type RiskFilter = 'ALL' | RiskLevel;
type DeliveryWindowFilter = 'ALL' | 'OVERDUE' | 'TODAY' | 'NEXT_7' | 'CUSTOM';
type OrderSort = 'RISK' | 'DELIVERY_ASC' | 'DELIVERY_DESC' | 'CUSTOMER' | 'ORDER_NUMBER';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [AsyncPipe, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './orders-list-page.component.html',
  styleUrl: './orders-list-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListPageComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly ordersService = inject(OrdersService);
  private readonly toastService = inject(ToastService);

  protected isRiskHelpOpen = false;
  protected openStatusMenuOrderId = '';
  protected updatingStatusOrderId = '';
  protected readonly filterForm = this.formBuilder.nonNullable.group({
    search: '',
    status: 'ALL' as OrderStatusFilter,
    risk: 'ALL' as RiskFilter,
    deliveryWindow: 'ALL' as DeliveryWindowFilter,
    deliveryFrom: '',
    deliveryTo: '',
    sort: 'DELIVERY_ASC' as OrderSort
  });
  protected readonly statusOptions: Array<{ value: OrderStatusFilter; label: string }> = [
    { value: 'ALL', label: 'Todas' },
    { value: 'REGISTERED', label: 'Registrado' },
    { value: 'IN_PROGRESS', label: 'Em produção' },
    { value: 'PAUSED', label: 'Pausado' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'FINISHED', label: 'Finalizado' }
  ];
  protected readonly riskOptions: Array<{ value: RiskFilter; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'CRITICAL', label: 'Crítico' },
    { value: 'HIGH', label: 'Alto' },
    { value: 'MEDIUM', label: 'Médio' },
    { value: 'LOW', label: 'Baixo' }
  ];
  protected readonly deliveryWindowOptions: Array<{ value: DeliveryWindowFilter; label: string }> = [
    { value: 'ALL', label: 'Todas' },
    { value: 'OVERDUE', label: 'Atrasadas' },
    { value: 'TODAY', label: 'Hoje' },
    { value: 'NEXT_7', label: 'Próximos 7 dias' },
    { value: 'CUSTOM', label: 'Período personalizado' }
  ];
  protected readonly sortOptions: Array<{ value: OrderSort; label: string }> = [
    { value: 'DELIVERY_ASC', label: 'Entrega mais próxima' },
    { value: 'DELIVERY_DESC', label: 'Entrega mais distante' },
    { value: 'RISK', label: 'Risco de atraso preliminar' },
    { value: 'CUSTOMER', label: 'Cliente A-Z' },
    { value: 'ORDER_NUMBER', label: 'Código do pedido' }
  ];
  protected readonly viewModel$ = combineLatest([
    this.ordersService.orders$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue()))
  ]).pipe(
    map(([orders, filters]) => {
      const filteredOrders = this.sortOrders(this.filterOrders(orders, filters), filters.sort ?? 'DELIVERY_ASC');

      return {
        totalCount: orders.length,
        orders: filteredOrders,
        resultSummary: this.getResultSummary(filteredOrders.length, orders.length),
        hasActiveFilters: this.hasActiveFilters(filters)
      };
    })
  );
  protected readonly formatDate = formatDate;
  protected readonly getRiskBadgeClass = getRiskBadgeClass;
  protected readonly getRiskDescription = getRiskDescription;
  protected readonly getRiskLabel = getRiskLabel;
  protected readonly getStatusBadgeClass = getStatusBadgeClass;
  protected readonly getStatusLabel = getStatusLabel;
  protected readonly trackByOrderId = trackByOrderId;

  protected clearFilters(): void {
    this.filterForm.reset({
      search: '',
      status: 'ALL',
      risk: 'ALL',
      deliveryWindow: 'ALL',
      deliveryFrom: '',
      deliveryTo: '',
      sort: 'DELIVERY_ASC'
    });
  }

  protected openRiskHelp(): void {
    this.isRiskHelpOpen = true;
  }

  protected closeRiskHelp(): void {
    this.isRiskHelpOpen = false;
  }

  protected toggleStatusMenu(orderId: string): void {
    this.openStatusMenuOrderId = this.openStatusMenuOrderId === orderId ? '' : orderId;
  }

  protected closeStatusMenu(): void {
    this.openStatusMenuOrderId = '';
  }

  protected isStatusMenuOpen(orderId: string): boolean {
    return this.openStatusMenuOrderId === orderId;
  }

  protected isUpdatingStatus(orderId: string): boolean {
    return this.updatingStatusOrderId === orderId;
  }

  protected getStatusActionOptions(status: OrderStatus): Array<{ value: OrderStatus; label: string; actionLabel: string }> {
    return getNextStatusOptions(status);
  }

  protected updateStatus(order: Order, nextStatus: OrderStatus): void {
    if (this.updatingStatusOrderId) {
      return;
    }

    const actionLabel = getStatusActionLabel(nextStatus);
    if (nextStatus === 'CANCELED' || nextStatus === 'FINISHED') {
      this.confirmDialogService.open({
        title: nextStatus === 'CANCELED' ? 'Cancelar pedido?' : 'Finalizar pedido?',
        message:
          nextStatus === 'CANCELED'
            ? `O pedido ${order.orderNumber} será marcado como cancelado. Deseja continuar?`
            : `O pedido ${order.orderNumber} será marcado como finalizado. Deseja continuar?`,
        confirmLabel: nextStatus === 'CANCELED' ? 'Confirmar cancelamento' : 'Confirmar finalização',
        cancelLabel: 'Voltar',
        onConfirm: () => this.persistStatusChange(order, nextStatus, actionLabel)
      });
      return;
    }

    this.persistStatusChange(order, nextStatus, actionLabel);
  }

  @HostListener('document:keydown.escape')
  protected handleEscapeKey(): void {
    if (this.isRiskHelpOpen) {
      this.closeRiskHelp();
    }

    if (this.openStatusMenuOrderId) {
      this.closeStatusMenu();
    }
  }

  private persistStatusChange(order: Order, nextStatus: OrderStatus, actionLabel: string): void {
    this.updatingStatusOrderId = order.id;
    this.closeStatusMenu();
    this.changeDetectorRef.markForCheck();

    this.ordersService
      .updateOrderStatus(order.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updatingStatusOrderId = '';
          this.toastService.success('Status atualizado', `Pedido ${order.orderNumber}: ${actionLabel}.`);
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.updatingStatusOrderId = '';
          this.toastService.danger('Erro ao atualizar status', 'Não foi possível atualizar o status do pedido.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private filterOrders(orders: ReadonlyArray<Order>, filters: Partial<ReturnType<typeof this.filterForm.getRawValue>>): Order[] {
    const search = this.normalize(filters.search ?? '');
    const status = filters.status ?? 'ALL';
    const risk = filters.risk ?? 'ALL';
    const deliveryWindow = filters.deliveryWindow ?? 'ALL';
    const { deliveryFrom, deliveryTo } = this.resolveDeliveryRange(
      deliveryWindow,
      filters.deliveryFrom ?? '',
      filters.deliveryTo ?? ''
    );

    return orders.filter((order) => {
      const haystack = this.normalize(
        `${order.orderNumber} ${order.customerName} ${order.products.map((product) => product.name).join(' ')}`
      );
      const matchesSearch = !search || haystack.includes(search);
      const matchesStatus = status === 'ALL' || order.status === status;
      const matchesRisk = risk === 'ALL' || order.riskLevel === risk;
      const matchesDeliveryFrom = !deliveryFrom || !order.deliveryDate || order.deliveryDate >= deliveryFrom;
      const matchesDeliveryTo = !deliveryTo || !order.deliveryDate || order.deliveryDate <= deliveryTo;

      return matchesSearch && matchesStatus && matchesRisk && matchesDeliveryFrom && matchesDeliveryTo;
    });
  }

  private sortOrders(orders: ReadonlyArray<Order>, sort: OrderSort): Order[] {
    if (sort === 'RISK') {
      return sortOrdersByRisk(orders);
    }

    return [...orders].sort((left, right) => {
      if (sort === 'DELIVERY_DESC') {
        return (right.deliveryDate || '').localeCompare(left.deliveryDate || '');
      }

      if (sort === 'CUSTOMER') {
        return left.customerName.localeCompare(right.customerName, 'pt-BR');
      }

      if (sort === 'ORDER_NUMBER') {
        return left.orderNumber.localeCompare(right.orderNumber, 'pt-BR');
      }

      return (left.deliveryDate || '9999-12-31').localeCompare(right.deliveryDate || '9999-12-31');
    });
  }

  private hasActiveFilters(filters: Partial<ReturnType<typeof this.filterForm.getRawValue>>): boolean {
    return (
      Boolean(filters.search?.trim()) ||
      filters.status !== 'ALL' ||
      filters.risk !== 'ALL' ||
      filters.deliveryWindow !== 'ALL' ||
      Boolean(filters.deliveryFrom) ||
      Boolean(filters.deliveryTo)
    );
  }

  private getResultSummary(filteredCount: number, totalCount: number): string {
    const noun = filteredCount === 1 ? 'pedido' : 'pedidos';

    return filteredCount === totalCount ? `${filteredCount} ${noun}` : `${filteredCount} de ${totalCount} ${noun}`;
  }

  private resolveDeliveryRange(
    deliveryWindow: DeliveryWindowFilter,
    deliveryFrom: string,
    deliveryTo: string
  ): { deliveryFrom: string; deliveryTo: string } {
    const today = this.formatDateInput(new Date());

    if (deliveryWindow === 'OVERDUE') {
      return { deliveryFrom: '', deliveryTo: this.addDays(today, -1) };
    }

    if (deliveryWindow === 'TODAY') {
      return { deliveryFrom: today, deliveryTo: today };
    }

    if (deliveryWindow === 'NEXT_7') {
      return { deliveryFrom: today, deliveryTo: this.addDays(today, 7) };
    }

    if (deliveryWindow === 'CUSTOM') {
      return { deliveryFrom, deliveryTo };
    }

    return { deliveryFrom: '', deliveryTo: '' };
  }

  private addDays(dateValue: string, amount: number): string {
    const date = new Date(`${dateValue}T00:00:00`);
    date.setDate(date.getDate() + amount);

    return this.formatDateInput(date);
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
