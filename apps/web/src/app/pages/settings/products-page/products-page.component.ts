import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateProductInput, Product, Variable } from '@trinus/contracts';
import { Observable, forkJoin, map } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { SearchableSelectComponent, type SearchableSelectOption } from '../../../shared/searchable-select/searchable-select.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';
import { activeOrSelected, toOptions } from '../master-data-options';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule, SearchableSelectComponent],
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsPageComponent extends MasterDataCrudPageBase<Product> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Produtos',
    description: 'Cadastre produtos, precos e variaveis padrao.',
    createLabel: 'Novo produto',
    empty: 'Nenhum produto cadastrado.'
  };

  protected variables: Variable[] = [];
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    isActive: true,
    variableDefaults: this.formBuilder.array([])
  });

  protected readonly recordSubtitle = (record: Product): string => `Venda: R$ ${record.salePrice.toFixed(2)} - ${record.variableDefaults.length} variaveis`;

  protected get productVariableDefaults(): FormArray {
    return this.form.controls.variableDefaults;
  }

  constructor() {
    super({ backLink: '/dashboard', backLabel: 'Voltar para dashboard', sectionLabel: 'Cadastros' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<Product[]> {
    return forkJoin({
      variables: this.masterDataService.listVariables(),
      products: this.masterDataService.listProducts()
    }).pipe(
      map(({ variables, products }) => {
        this.variables = variables;
        return products;
      })
    );
  }

  protected createRecord(): Observable<Product> {
    return this.masterDataService.createProduct(this.normalizeInput());
  }

  protected updateRecord(id: string): Observable<Product> {
    return this.masterDataService.updateProduct(id, this.normalizeInput());
  }

  protected updateStatus(record: Product, isActive: boolean): Observable<Product> {
    return this.masterDataService.updateProduct(record.id, { isActive });
  }

  protected deleteRecordRequest(record: Product): Observable<Product> {
    return this.masterDataService.deleteProduct(record.id);
  }

  protected resetForm(record?: Product | null): void {
    this.productVariableDefaults.clear();
    for (const item of record?.variableDefaults ?? []) {
      this.productVariableDefaults.push(this.createProductVariableDefaultGroup(item.variableId, item.value));
    }
    this.form.reset({
      name: record?.name ?? '',
      costPrice: record?.costPrice ?? 0,
      salePrice: record?.salePrice ?? 0,
      isActive: record?.isActive ?? true
    });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid || this.hasInvalidProductVariableDefaults();
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }

  protected addProductVariableDefault(): void {
    this.productVariableDefaults.push(this.createProductVariableDefaultGroup());
  }

  protected removeProductVariableDefault(index: number): void {
    this.productVariableDefaults.removeAt(index);
    this.productVariableDefaults.markAsDirty();
  }

  protected productVariableOptionsFor(variableId: string): SearchableSelectOption[] {
    return toOptions(activeOrSelected(this.variables, variableId), 'Nenhuma');
  }

  private createProductVariableDefaultGroup(variableId = '', value = 1) {
    return this.formBuilder.nonNullable.group({
      variableId,
      value: [value, [Validators.min(0.01)]]
    });
  }

  private hasInvalidProductVariableDefaults(): boolean {
    return this.productVariableDefaults.controls.some((control) => {
      const value = control.getRawValue();
      return Boolean(value.variableId) && (!Number.isFinite(Number(value.value)) || Number(value.value) <= 0);
    });
  }

  private normalizeInput(): CreateProductInput {
    const value = this.form.getRawValue();
    const variableDefaults = value.variableDefaults as Array<{ variableId: string; value: number }>;
    return {
      name: value.name,
      costPrice: Number(value.costPrice),
      salePrice: Number(value.salePrice),
      isActive: value.isActive,
      variableDefaults: variableDefaults
        .filter((item) => item.variableId)
        .map((item) => ({
          variableId: item.variableId,
          value: Number(item.value)
        }))
    };
  }
}
