import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { CreateOrderInput, Order, UpdateOrderInput } from '@trinus/contracts';
import { OrdersService } from '../../services-api/orders.service';
import { FormFieldErrorComponent } from '../../shared/form-field-error.component';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderFormPageComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  protected editingOrderId = '';
  protected errorMessage = '';
  protected isSaving = false;
  protected readonly orderForm = this.formBuilder.nonNullable.group({
    customerName: ['', [Validators.required, Validators.maxLength(80)]],
    orderNumber: ['', [Validators.required, Validators.maxLength(40)]],
    startDate: ['', [Validators.required]],
    deliveryDate: ['', [Validators.required]],
    products: this.formBuilder.array([this.createProductForm()]),
    finalNotes: ['', [Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.editingOrderId = params.get('id') ?? '';

      if (!this.editingOrderId) {
        this.resetOrderForm();
      }
    });

    this.ordersService.orders$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((orders) => {
        this.fillFormForEditing(orders);
      });
  }

  protected saveOrder(): void {
    this.clearMessages();

    if (this.orderForm.invalid || this.orderForm.controls.products.length === 0) {
      this.orderForm.markAllAsTouched();
      this.errorMessage = this.getInvalidFormMessage();
      return;
    }

    this.isSaving = true;

    const value = this.orderForm.getRawValue();
    const request: CreateOrderInput | UpdateOrderInput = {
      orderNumber: value.orderNumber,
      customerName: value.customerName,
      startDate: value.startDate,
      deliveryDate: value.deliveryDate,
      finalNotes: value.finalNotes.trim() || undefined,
      products: value.products.map((product) => ({
        name: product.name.trim(),
        quantity: product.quantity
      }))
    };

    const saveRequest = this.editingOrderId
      ? this.ordersService.updateOrder(this.editingOrderId, request)
      : this.ordersService.createOrder(request as CreateOrderInput);

    saveRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.toastService.success(
            this.editingOrderId ? 'Pedido atualizado' : 'Pedido salvo',
            this.editingOrderId ? 'Pedido atualizado com sucesso.' : 'Pedido salvo com sucesso.'
          );
          this.resetOrderForm();
          this.changeDetectorRef.markForCheck();
          void this.router.navigateByUrl('/pedidos');
        },
        error: () => {
          this.isSaving = false;
          this.errorMessage = 'Não foi possível salvar o pedido.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected getProductControls() {
    return this.orderForm.controls.products.controls;
  }

  protected addProduct(): void {
    this.orderForm.controls.products.push(this.createProductForm());
  }

  protected removeProduct(index: number): void {
    if (this.orderForm.controls.products.length === 1) {
      this.orderForm.controls.products.at(0).reset({
        name: '',
        quantity: 1
      });
      this.orderForm.controls.products.at(0).markAllAsTouched();
      this.errorMessage = 'Adicione pelo menos um item.';
      return;
    }

    this.orderForm.controls.products.removeAt(index);
  }

  private clearMessages(): void {
    this.errorMessage = '';
  }

  private fillFormForEditing(orders: ReadonlyArray<Order>): void {
    if (!this.editingOrderId) {
      return;
    }

    const order = orders.find((item) => item.id === this.editingOrderId);

    if (!order) {
      return;
    }

    const firstProduct = order.products[0];

    this.orderForm.controls.products.clear();
    for (const product of order.products.length > 0 ? order.products : [{ name: '', quantity: 1 }]) {
      this.orderForm.controls.products.push(this.createProductForm(product.name, product.quantity));
    }

    this.orderForm.reset({
      customerName: order.customerName,
      orderNumber: order.orderNumber,
      startDate: order.startDate,
      deliveryDate: order.deliveryDate,
      products: order.products.length > 0 ? order.products : [{ name: firstProduct?.name ?? '', quantity: firstProduct?.quantity ?? 1 }],
      finalNotes: order.finalNotes ?? ''
    });
    this.changeDetectorRef.markForCheck();
  }

  private resetOrderForm(): void {
    this.orderForm.controls.products.clear();
    this.orderForm.controls.products.push(this.createProductForm());
    this.orderForm.reset({
      customerName: '',
      orderNumber: '',
      startDate: '',
      deliveryDate: '',
      products: [{ name: '', quantity: 1 }],
      finalNotes: ''
    });
  }

  private createProductForm(name = '', quantity = 1) {
    return this.formBuilder.nonNullable.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      quantity: [quantity, [Validators.required, this.validateQuantity]]
    });
  }

  private getInvalidFormMessage(): string {
    if (this.orderForm.controls.products.length === 0 || this.orderForm.controls.products.invalid) {
      return 'Existem campos incompletos nos itens do pedido.';
    }

    return 'Corrija os campos destacados antes de salvar.';
  }

  private validateQuantity(control: AbstractControl<number>): ValidationErrors | null {
    const value = Number(control.value);

    if (!Number.isFinite(value) || value <= 0) {
      return { minValue: { min: 0 } };
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(control.value))) {
      return { decimalPlaces: { max: 2 } };
    }

    return null;
  }
}
