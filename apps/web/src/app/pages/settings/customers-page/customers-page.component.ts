import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateCustomerInput, Customer } from '@trinus/contracts';
import type { Observable } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomersPageComponent extends MasterDataCrudPageBase<Customer> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Clientes',
    description: 'Cadastre clientes usados nos pedidos.',
    createLabel: 'Novo cliente',
    empty: 'Nenhum cliente cadastrado.'
  };

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    cpf: ['', [Validators.maxLength(20)]],
    cnpj: ['', [Validators.maxLength(24)]],
    address: ['', [Validators.maxLength(160)]],
    mobilePhone: ['', [Validators.maxLength(24)]],
    landlinePhone: ['', [Validators.maxLength(24)]],
    isActive: true
  });

  protected readonly recordSubtitle = (record: Customer): string => record.cpf || record.cnpj || record.mobilePhone || 'Sem documento';

  constructor() {
    super({ backLink: '/dashboard', backLabel: 'Voltar para dashboard', sectionLabel: 'Cadastros' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<Customer[]> {
    return this.masterDataService.listCustomers();
  }

  protected createRecord(): Observable<Customer> {
    return this.masterDataService.createCustomer(this.form.getRawValue() as CreateCustomerInput);
  }

  protected updateRecord(id: string): Observable<Customer> {
    return this.masterDataService.updateCustomer(id, this.form.getRawValue());
  }

  protected updateStatus(record: Customer, isActive: boolean): Observable<Customer> {
    return this.masterDataService.updateCustomer(record.id, { isActive });
  }

  protected deleteRecordRequest(record: Customer): Observable<Customer> {
    return this.masterDataService.deleteCustomer(record.id);
  }

  protected resetForm(record?: Customer | null): void {
    this.form.reset({
      name: record?.name ?? '',
      cpf: record?.cpf ?? '',
      cnpj: record?.cnpj ?? '',
      address: record?.address ?? '',
      mobilePhone: record?.mobilePhone ?? '',
      landlinePhone: record?.landlinePhone ?? '',
      isActive: record?.isActive ?? true
    });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }
}
