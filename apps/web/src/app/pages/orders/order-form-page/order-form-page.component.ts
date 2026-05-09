import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { ClothingSize, CreateOrderInput, Customer, Order, OrderItem, OrderQuantityMode, OrderStatus, Product, Stage, Template } from '@trinus/contracts';
import { forkJoin } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { OrdersService } from '../../../services-api/orders.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { SearchableSelectComponent, type SearchableSelectOption } from '../../../shared/searchable-select/searchable-select.component';
import { ToastService } from '../../../shared/toast.service';
import { getNextStatusOptions, getStatusActionLabel, getStatusBadgeClass, getStatusLabel } from '../orders-presenters';

@Component({
  selector: 'app-order-form-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule, RouterLink, SearchableSelectComponent],
  templateUrl: './order-form-page.component.html',
  styleUrl: './order-form-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderFormPageComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly masterDataService = inject(MasterDataService);
  private readonly ordersService = inject(OrdersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialogService = inject(ConfirmDialogService);

  protected customers: Customer[] = [];
  protected products: Product[] = [];
  protected sizes: ClothingSize[] = [];
  protected stages: Stage[] = [];
  protected templates: Template[] = [];
  protected editingOrderId = '';
  protected isLoading = false;
  protected isSaving = false;
  protected isStatusSaving = false;
  protected isCustomerDrawerOpen = false;
  protected isProductDrawerOpen = false;
  protected quickProductItemIndex = 0;
  protected readonly orderForm = this.formBuilder.nonNullable.group({
    customerId: ['', [Validators.required]],
    orderNumber: ['', [Validators.required, Validators.maxLength(40)]],
    status: ['REGISTERED' as OrderStatus],
    startDate: [''],
    deliveryDate: [''],
    items: this.formBuilder.array([this.createItemGroup()]),
    finalNotes: ['', [Validators.maxLength(500)]]
  });
  protected readonly quickCustomerForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    mobilePhone: ['']
  });
  protected readonly quickProductForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]]
  });

  protected get itemControls(): FormArray {
    return this.orderForm.controls.items;
  }

  protected get customerOptions(): SearchableSelectOption[] {
    return this.customers
      .filter((customer) => customer.isActive || customer.id === this.orderForm.controls.customerId.value)
      .map((customer) => ({ value: customer.id, label: this.getCustomerLabel(customer) }));
  }

  protected get productOptions(): SearchableSelectOption[] {
    return this.products.filter((product) => product.isActive).map((product) => ({ value: product.id, label: product.name }));
  }

  protected get templateOptions(): SearchableSelectOption[] {
    return this.templates.filter((template) => template.isActive).map((template) => ({ value: template.id, label: template.name }));
  }

  protected get stageOptions(): SearchableSelectOption[] {
    return this.stages.filter((stage) => stage.isActive).map((stage) => ({ value: stage.id, label: stage.name }));
  }

  protected get currentStatus(): OrderStatus {
    return this.orderForm.controls.status.value;
  }

  protected get statusActions(): Array<{ value: OrderStatus; label: string; actionLabel: string }> {
    return getNextStatusOptions(this.currentStatus);
  }

  protected readonly getStatusBadgeClass = getStatusBadgeClass;
  protected readonly getStatusLabel = getStatusLabel;

  ngOnInit(): void {
    this.editingOrderId = this.route.snapshot.paramMap.get('id') ?? '';
    this.orderForm.controls.startDate.setValue(this.getCurrentDateString());
    this.loadDependencies();
  }

  protected addItem(): void {
    this.itemControls.push(this.createItemGroup());
  }

  protected removeItem(index: number): void {
    if (this.itemControls.length === 1) {
      this.toastService.warning('Atenção', 'Pedido deve ter pelo menos um item.');
      return;
    }

    this.itemControls.removeAt(index);
  }

  protected getSizeControls(index: number): FormArray {
    return this.itemControls.at(index).get('sizes') as FormArray;
  }

  protected getStageControls(index: number): FormArray {
    return this.itemControls.at(index).get('stages') as FormArray;
  }

  protected getAvailableSizeOptions(itemIndex: number): SearchableSelectOption[] {
    const selectedSizeIds = new Set(this.getSizeControls(itemIndex).controls.map((sizeControl) => String(sizeControl.get('sizeId')?.value ?? '')));

    return this.sizes
      .filter((size) => size.isActive && !selectedSizeIds.has(size.id))
      .map((size) => ({ value: size.id, label: size.name }));
  }

  protected addSize(itemIndex: number, sizeId: string): void {
    const normalizedSizeId = sizeId.trim();
    if (!normalizedSizeId) {
      this.toastService.warning('Tamanho obrigatório', 'Selecione um tamanho para adicionar na grade.');
      return;
    }

    const sizeControls = this.getSizeControls(itemIndex);
    if (sizeControls.controls.some((sizeControl) => sizeControl.get('sizeId')?.value === normalizedSizeId)) {
      this.toastService.warning('Tamanho duplicado', 'O mesmo tamanho não pode ser adicionado duas vezes no mesmo item.');
      return;
    }

    sizeControls.push(this.createSizeGroup(normalizedSizeId, 0));
    this.syncQuantityModeWithSizes(itemIndex);
  }

  protected removeSize(itemIndex: number, sizeIndex: number): void {
    this.getSizeControls(itemIndex).removeAt(sizeIndex);
    this.syncQuantityModeWithSizes(itemIndex);
  }

  protected onTemplateSelected(index: number): void {
    const item = this.itemControls.at(index);
    const templateId = String(item.get('templateId')?.value ?? '');
    const hasStages = this.getStageControls(index).length > 0;

    if (!templateId) {
      return;
    }

    if (hasStages) {
      this.confirmDialogService.open({
        title: 'Sobrescrever etapas',
        message: 'As etapas atuais serão substituídas pelas etapas do template selecionado. Deseja continuar?',
        confirmLabel: 'Sobrescrever',
        cancelLabel: 'Cancelar',
        onConfirm: () => this.applyTemplate(index, templateId)
      });
      return;
    }

    this.applyTemplate(index, templateId);
  }

  protected resetStages(index: number): void {
    if (this.getStageControls(index).length === 0) {
      return;
    }

    this.confirmDialogService.open({
      title: 'Resetar etapas',
      message: 'Todas as etapas deste item serão apagadas. Deseja continuar?',
      confirmLabel: 'Resetar',
      cancelLabel: 'Cancelar',
      onConfirm: () => {
        this.itemControls.at(index).get('templateId')?.setValue('');
        this.getStageControls(index).clear();
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected addStage(index: number): void {
    this.getStageControls(index).push(this.createStageGroup('', this.getStageControls(index).length));
  }

  protected removeStage(itemIndex: number, stageIndex: number): void {
    this.getStageControls(itemIndex).removeAt(stageIndex);
  }

  protected moveStageUp(itemIndex: number, stageIndex: number): void {
    this.moveStage(itemIndex, stageIndex, stageIndex - 1);
  }

  protected moveStageDown(itemIndex: number, stageIndex: number): void {
    this.moveStage(itemIndex, stageIndex, stageIndex + 1);
  }

  protected getProductName(productId: string): string {
    return this.products.find((product) => product.id === productId)?.name ?? 'Produto não selecionado';
  }

  protected getSizeName(sizeId: string): string {
    return this.sizes.find((size) => size.id === sizeId)?.name ?? 'Tamanho';
  }

  protected getItemTotal(index: number): number {
    const item = this.itemControls.at(index).getRawValue() as { quantityMode: OrderQuantityMode; quantity: number; sizes: Array<{ quantity: number }> };
    if (item.quantityMode === 'SINGLE') {
      return Number(item.quantity) || 0;
    }

    return item.sizes.reduce((sum, size) => sum + (Number(size.quantity) || 0), 0);
  }

  protected openCustomerDrawer(): void {
    this.quickCustomerForm.reset({ name: '', mobilePhone: '' });
    this.isCustomerDrawerOpen = true;
  }

  protected openProductDrawer(itemIndex: number): void {
    this.quickProductItemIndex = itemIndex;
    this.quickProductForm.reset({ name: '', costPrice: 0, salePrice: 0 });
    this.isProductDrawerOpen = true;
  }

  protected closeQuickDrawers(): void {
    this.isCustomerDrawerOpen = false;
    this.isProductDrawerOpen = false;
  }

  protected createQuickCustomer(): void {
    if (this.quickCustomerForm.invalid) {
      this.quickCustomerForm.markAllAsTouched();
      this.toastService.warning('Corrija os dados', 'Revise os campos do cliente antes de cadastrar.');
      return;
    }

    const value = this.quickCustomerForm.getRawValue();
    this.masterDataService
      .createCustomer({ name: value.name, mobilePhone: value.mobilePhone.trim() || undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customer) => {
          this.customers = [...this.customers, customer].sort((left, right) => left.name.localeCompare(right.name));
          this.orderForm.controls.customerId.setValue(customer.id);
          this.closeQuickDrawers();
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.toastService.danger('Erro ao cadastrar cliente', 'Não foi possível cadastrar o cliente.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected createQuickProduct(): void {
    if (this.quickProductForm.invalid) {
      this.quickProductForm.markAllAsTouched();
      this.toastService.warning('Corrija os dados', 'Revise os campos do produto antes de cadastrar.');
      return;
    }

    const value = this.quickProductForm.getRawValue();
    this.masterDataService
      .createProduct({ name: value.name, costPrice: Number(value.costPrice), salePrice: Number(value.salePrice) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.products = [...this.products, product].sort((left, right) => left.name.localeCompare(right.name));
          this.itemControls.at(this.quickProductItemIndex).get('productId')?.setValue(product.id);
          this.closeQuickDrawers();
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.toastService.danger('Erro ao cadastrar produto', 'Não foi possível cadastrar o produto.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected saveOrder(): void {
    if (this.orderForm.invalid || this.hasInvalidItems()) {
      this.orderForm.markAllAsTouched();
      this.toastService.warning('Corrija os campos', 'Corrija os campos destacados antes de salvar.');
      return;
    }

    this.isSaving = true;
    const request = this.normalizeInput();
    const saveRequest = this.editingOrderId
      ? this.ordersService.updateOrder(this.editingOrderId, { ...request, orderNumber: undefined })
      : this.ordersService.createOrder(request);

    saveRequest.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success(
          this.editingOrderId ? 'Pedido atualizado' : 'Pedido salvo',
          this.editingOrderId ? 'Pedido atualizado com sucesso.' : 'Pedido salvo com sucesso.'
        );
        this.isSaving = false;
        this.changeDetectorRef.markForCheck();
        void this.router.navigateByUrl('/pedidos');
      },
      error: () => {
        this.isSaving = false;
        this.toastService.danger('Erro ao salvar pedido', 'Não foi possível salvar o pedido.');
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected requestStatusChange(nextStatus: OrderStatus): void {
    if (!this.editingOrderId || this.isStatusSaving || this.currentStatus === nextStatus) {
      return;
    }

    const actionLabel = getStatusActionLabel(nextStatus);
    if (nextStatus === 'CANCELED' || nextStatus === 'FINISHED') {
      this.confirmDialogService.open({
        title: nextStatus === 'CANCELED' ? 'Cancelar pedido?' : 'Finalizar pedido?',
        message:
          nextStatus === 'CANCELED'
            ? `O pedido ${this.orderForm.controls.orderNumber.value} será marcado como cancelado. Deseja continuar?`
            : `O pedido ${this.orderForm.controls.orderNumber.value} será marcado como finalizado. Deseja continuar?`,
        confirmLabel: nextStatus === 'CANCELED' ? 'Confirmar cancelamento' : 'Confirmar finalização',
        cancelLabel: 'Voltar',
        onConfirm: () => this.persistStatusChange(nextStatus, actionLabel)
      });
      return;
    }

    this.persistStatusChange(nextStatus, actionLabel);
  }

  private loadDependencies(): void {
    this.isLoading = true;
    forkJoin({
      customers: this.masterDataService.listCustomers(),
      products: this.masterDataService.listProducts(),
      sizes: this.masterDataService.listSizes(),
      stages: this.masterDataService.listStages(),
      templates: this.masterDataService.listTemplates()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dependencies) => {
          this.customers = dependencies.customers;
          this.products = dependencies.products;
          this.sizes = dependencies.sizes;
          this.stages = dependencies.stages;
          this.templates = dependencies.templates;
          this.isLoading = false;
          this.loadEditingOrder();
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.toastService.danger('Erro ao carregar dados', 'Não foi possível carregar os dados para o pedido.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private loadEditingOrder(): void {
    if (!this.editingOrderId) {
      return;
    }

    this.ordersService
      .getOrder(this.editingOrderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.fillForm(order);
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.toastService.danger('Pedido não encontrado', 'Não foi possível localizar o pedido informado.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private fillForm(order: Order): void {
    this.itemControls.clear();
    for (const item of order.items) {
      this.itemControls.push(this.createItemGroup(item));
    }

    this.orderForm.reset({
      customerId: order.customerId,
      orderNumber: order.orderNumber,
      status: order.status,
      startDate: order.startDate,
      deliveryDate: order.deliveryDate,
      finalNotes: order.finalNotes ?? ''
    });
  }

  private createItemGroup(item?: OrderItem) {
    const group = this.formBuilder.nonNullable.group({
      productId: [item?.productId ?? '', [Validators.required]],
      quantityMode: [item?.quantityMode ?? ('SINGLE' as OrderQuantityMode), [Validators.required]],
      quantity: [item?.quantity ?? 1, [Validators.min(0.01)]],
      templateId: [item?.templateId ?? ''],
      selectedSizeToAdd: [''],
      sizes: this.formBuilder.array<ReturnType<OrderFormPageComponent['createSizeGroup']>>([]),
      stages: this.formBuilder.array<ReturnType<OrderFormPageComponent['createStageGroup']>>([]),
      notes: [item?.notes ?? '', [Validators.maxLength(500)]]
    });

    for (const size of item?.sizes ?? []) {
      group.controls.sizes.push(this.createSizeGroup(size.sizeId, size.quantity));
    }

    for (const stage of item?.stages ?? []) {
      group.controls.stages.push(this.createStageGroup(stage.stageId, stage.position));
    }

    group.controls.quantityMode.setValue(group.controls.sizes.length > 0 ? 'SIZE_GRID' : 'SINGLE');
    return group;
  }

  private createSizeGroup(sizeId: string, quantity: number) {
    return this.formBuilder.nonNullable.group({
      sizeId,
      quantity: [quantity, [Validators.min(0)]]
    });
  }

  private createStageGroup(stageId: string, position: number) {
    return this.formBuilder.nonNullable.group({
      stageId: [stageId, [Validators.required]],
      position
    });
  }

  private hasInvalidItems(): boolean {
    const value = this.orderForm.getRawValue() as {
      items: Array<{ productId: string; quantity: number; sizes: Array<{ quantity: number }> }>;
    };

    if (value.items.length === 0) {
      return true;
    }

    return value.items.some((item) => {
      if (!item.productId) {
        return true;
      }

      if (item.sizes.length === 0) {
        return !this.isPositiveQuantity(item.quantity);
      }

      return !item.sizes.some((size) => this.isPositiveQuantity(size.quantity));
    });
  }

  private normalizeInput(): CreateOrderInput {
    const value = this.orderForm.getRawValue() as {
      customerId: string;
      orderNumber: string;
      status: OrderStatus;
      startDate: string;
      deliveryDate: string;
      finalNotes: string;
      items: Array<{
        productId: string;
        templateId: string;
        quantity: number;
        sizes: Array<{ sizeId: string; quantity: number }>;
        stages: Array<{ stageId: string }>;
        notes: string;
      }>;
    };

    return {
      customerId: value.customerId,
      orderNumber: value.orderNumber,
      status: value.status,
      startDate: value.startDate || undefined,
      deliveryDate: value.deliveryDate || undefined,
      finalNotes: value.finalNotes.trim() || undefined,
      items: value.items.map((item, index) => ({
        productId: item.productId,
        templateId: item.templateId || undefined,
        position: index,
        quantityMode: item.sizes.length > 0 ? 'SIZE_GRID' : 'SINGLE',
        quantity: item.sizes.length === 0 ? Number(item.quantity) : undefined,
        sizes:
          item.sizes.length > 0
            ? item.sizes
                .filter((size) => this.isPositiveQuantity(size.quantity))
                .map((size) => ({ sizeId: size.sizeId, quantity: Number(size.quantity) }))
            : undefined,
        stages: item.stages.map((stage, stageIndex) => ({ stageId: stage.stageId, position: stageIndex })),
        notes: item.notes.trim() || undefined
      }))
    };
  }

  private applyTemplate(index: number, templateId: string): void {
    const template = this.templates.find((record) => record.id === templateId);
    const stages = this.getStageControls(index);
    stages.clear();

    if (!template) {
      return;
    }

    for (const templateItem of template.items) {
      stages.push(this.createStageGroup(templateItem.stageId, templateItem.position));
    }
  }

  private syncQuantityModeWithSizes(index: number): void {
    const hasSizes = this.getSizeControls(index).length > 0;
    this.itemControls.at(index).get('quantityMode')?.setValue(hasSizes ? 'SIZE_GRID' : 'SINGLE');
    this.itemControls.at(index).get('selectedSizeToAdd')?.setValue('');
  }

  private moveStage(itemIndex: number, fromIndex: number, toIndex: number): void {
    const stages = this.getStageControls(itemIndex);
    if (toIndex < 0 || toIndex >= stages.length) {
      return;
    }

    const control = stages.at(fromIndex);
    stages.removeAt(fromIndex);
    stages.insert(toIndex, control);
  }

  private isPositiveQuantity(value: number): boolean {
    return Number.isFinite(Number(value)) && Number(value) > 0 && /^\d+(\.\d{1,2})?$/.test(String(value));
  }

  private getCurrentDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private getCustomerLabel(customer: Customer): string {
    const document = customer.cpf || customer.cnpj || customer.mobilePhone;
    return document ? `${customer.name} - ${document}` : customer.name;
  }

  private persistStatusChange(nextStatus: OrderStatus, actionLabel: string): void {
    this.isStatusSaving = true;
    this.ordersService
      .updateOrderStatus(this.editingOrderId, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.orderForm.controls.status.setValue(order.status);
          this.isStatusSaving = false;
          this.toastService.success('Status atualizado', `${actionLabel}.`);
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.isStatusSaving = false;
          this.toastService.danger('Erro ao atualizar status', 'Não foi possível atualizar o status do pedido.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }
}
