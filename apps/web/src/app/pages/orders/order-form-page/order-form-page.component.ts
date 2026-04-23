import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type {
  ClothingSize,
  CreateOrderInput,
  Customer,
  Order,
  OrderItem,
  OrderQuantityMode,
  Product,
  Stage,
  Template
} from '@trinus/contracts';
import { forkJoin } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { OrdersService } from '../../../services-api/orders.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { SearchableSelectComponent, type SearchableSelectOption } from '../../../shared/searchable-select/searchable-select.component';
import { ToastService } from '../../../shared/toast.service';

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

  protected customers: Customer[] = [];
  protected products: Product[] = [];
  protected sizes: ClothingSize[] = [];
  protected stages: Stage[] = [];
  protected templates: Template[] = [];
  protected editingOrderId = '';
  protected errorMessage = '';
  protected isLoading = false;
  protected isSaving = false;
  protected isCustomerDrawerOpen = false;
  protected isProductDrawerOpen = false;
  protected quickProductItemIndex = 0;
  protected readonly orderForm = this.formBuilder.nonNullable.group({
    customerId: ['', [Validators.required]],
    orderNumber: ['', [Validators.required, Validators.maxLength(40)]],
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
    return [
      { value: '', label: 'Começar do zero' },
      ...this.templates.filter((template) => template.isActive).map((template) => ({ value: template.id, label: template.name }))
    ];
  }

  protected get stageOptions(): SearchableSelectOption[] {
    return this.stages.filter((stage) => stage.isActive).map((stage) => ({ value: stage.id, label: stage.name }));
  }

  ngOnInit(): void {
    this.editingOrderId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadDependencies();
  }

  protected addItem(): void {
    this.itemControls.push(this.createItemGroup());
  }

  protected removeItem(index: number): void {
    if (this.itemControls.length === 1) {
      this.errorMessage = 'Pedido deve ter pelo menos um item.';
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

  protected setQuantityMode(index: number, quantityMode: OrderQuantityMode): void {
    const item = this.itemControls.at(index);
    item.get('quantityMode')?.setValue(quantityMode);

    if (quantityMode === 'SIZE_GRID' && this.getSizeControls(index).length === 0) {
      for (const size of this.sizes.filter((record) => record.isActive)) {
        this.getSizeControls(index).push(this.createSizeGroup(size.id, 0));
      }
    }
  }

  protected applyTemplate(index: number): void {
    const item = this.itemControls.at(index);
    const templateId = item.get('templateId')?.value as string;
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

  protected startWithoutTemplate(index: number): void {
    this.itemControls.at(index).get('templateId')?.setValue('');
    this.getStageControls(index).clear();
  }

  protected addStage(index: number): void {
    this.getStageControls(index).push(this.createStageGroup('', this.getStageControls(index).length));
  }

  protected removeStage(itemIndex: number, stageIndex: number): void {
    this.getStageControls(itemIndex).removeAt(stageIndex);
  }

  protected getProductName(productId: string): string {
    return this.products.find((product) => product.id === productId)?.name ?? 'Produto não selecionado';
  }

  protected getTemplateName(templateId: string): string {
    return this.templates.find((template) => template.id === templateId)?.name ?? 'Sem template';
  }

  protected getSizeName(sizeId: string): string {
    return this.sizes.find((size) => size.id === sizeId)?.name ?? 'Tamanho';
  }

  protected getItemTotal(index: number): number {
    const item = this.itemControls.at(index).getRawValue() as {
      quantityMode: OrderQuantityMode;
      quantity: number;
      sizes: Array<{ quantity: number }>;
    };

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
      return;
    }

    const value = this.quickCustomerForm.getRawValue();
    this.masterDataService
      .createCustomer({
        name: value.name,
        mobilePhone: value.mobilePhone.trim() || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customer) => {
          this.customers = [...this.customers, customer].sort((left, right) => left.name.localeCompare(right.name));
          this.orderForm.controls.customerId.setValue(customer.id);
          this.closeQuickDrawers();
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Não foi possível cadastrar o cliente.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected createQuickProduct(): void {
    if (this.quickProductForm.invalid) {
      this.quickProductForm.markAllAsTouched();
      return;
    }

    const value = this.quickProductForm.getRawValue();
    this.masterDataService
      .createProduct({
        name: value.name,
        costPrice: Number(value.costPrice),
        salePrice: Number(value.salePrice)
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (product) => {
          this.products = [...this.products, product].sort((left, right) => left.name.localeCompare(right.name));
          this.itemControls.at(this.quickProductItemIndex).get('productId')?.setValue(product.id);
          this.closeQuickDrawers();
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Não foi possível cadastrar o produto.';
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected saveOrder(): void {
    this.errorMessage = '';

    if (this.orderForm.invalid || this.hasInvalidItems()) {
      this.orderForm.markAllAsTouched();
      this.errorMessage = 'Corrija os campos destacados antes de salvar.';
      return;
    }

    this.isSaving = true;
    const request = this.normalizeInput();
    const saveRequest = this.editingOrderId
      ? this.ordersService.updateOrder(this.editingOrderId, request)
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
        this.errorMessage = 'Não foi possível salvar o pedido.';
        this.changeDetectorRef.markForCheck();
      }
    });
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
          this.errorMessage = 'Não foi possível carregar os dados para o pedido.';
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
          this.errorMessage = 'Pedido não encontrado.';
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
      startDate: order.startDate,
      deliveryDate: order.deliveryDate,
      finalNotes: order.finalNotes ?? ''
    });
  }

  private createItemGroup(item?: OrderItem) {
    const group = this.formBuilder.nonNullable.group({
      productId: [item?.productId ?? '', [Validators.required]],
      quantityMode: [item?.quantityMode ?? 'SINGLE' as OrderQuantityMode, [Validators.required]],
      quantity: [item?.quantity ?? 1, [Validators.min(0.01)]],
      templateId: [item?.templateId ?? ''],
      sizes: this.formBuilder.array<ReturnType<OrderFormPageComponent['createSizeGroup']>>([]),
      stages: this.formBuilder.array<ReturnType<OrderFormPageComponent['createStageGroup']>>([]),
      notes: [item?.notes ?? '', [Validators.maxLength(500)]]
    });

    for (const size of item?.sizes ?? []) {
      group.controls.sizes.push(this.createSizeGroup(size.sizeId, size.quantity));
    }

    if (!item && group.controls.sizes.length === 0) {
      for (const size of this.sizes.filter((record) => record.isActive)) {
        group.controls.sizes.push(this.createSizeGroup(size.id, 0));
      }
    }

    for (const stage of item?.stages ?? []) {
      group.controls.stages.push(this.createStageGroup(stage.stageId, stage.position));
    }

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
      items: Array<{ productId: string; quantityMode: OrderQuantityMode; quantity: number; sizes: Array<{ quantity: number }> }>;
    };

    if (value.items.length === 0) {
      return true;
    }

    return value.items.some((item) => {
      if (!item.productId) {
        return true;
      }

      if (item.quantityMode === 'SINGLE') {
        return !this.isPositiveQuantity(item.quantity);
      }

      return !item.sizes.some((size) => this.isPositiveQuantity(size.quantity));
    });
  }

  private normalizeInput(): CreateOrderInput {
    const value = this.orderForm.getRawValue() as {
      customerId: string;
      orderNumber: string;
      startDate: string;
      deliveryDate: string;
      finalNotes: string;
      items: Array<{
        productId: string;
        templateId: string;
        quantityMode: OrderQuantityMode;
        quantity: number;
        sizes: Array<{ sizeId: string; quantity: number }>;
        stages: Array<{ stageId: string }>;
        notes: string;
      }>;
    };

    return {
      customerId: value.customerId,
      orderNumber: value.orderNumber,
      startDate: value.startDate || undefined,
      deliveryDate: value.deliveryDate || undefined,
      finalNotes: value.finalNotes.trim() || undefined,
      items: value.items.map((item, index) => ({
        productId: item.productId,
        templateId: item.templateId || undefined,
        position: index,
        quantityMode: item.quantityMode,
        quantity: item.quantityMode === 'SINGLE' ? Number(item.quantity) : undefined,
        sizes:
          item.quantityMode === 'SIZE_GRID'
            ? item.sizes
                .filter((size) => this.isPositiveQuantity(size.quantity))
                .map((size) => ({ sizeId: size.sizeId, quantity: Number(size.quantity) }))
            : undefined,
        stages: item.stages.map((stage, stageIndex) => ({
          stageId: stage.stageId,
          position: stageIndex
        })),
        notes: item.notes.trim() || undefined
      }))
    };
  }

  private isPositiveQuantity(value: number): boolean {
    return Number.isFinite(Number(value)) && Number(value) > 0 && /^\d+(\.\d{1,2})?$/.test(String(value));
  }

  private getCustomerLabel(customer: Customer): string {
    const document = customer.cpf || customer.cnpj || customer.mobilePhone;

    return document ? `${customer.name} - ${document}` : customer.name;
  }
}
