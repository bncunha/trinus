import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateVariableInput, Variable } from '@trinus/contracts';
import type { Observable } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';

@Component({
  selector: 'app-variables-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule],
  templateUrl: './variables-page.component.html',
  styleUrl: './variables-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariablesPageComponent extends MasterDataCrudPageBase<Variable> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Variáveis',
    description: 'Cadastre parâmetros numéricos simples usados em etapas e pedidos.',
    createLabel: 'Nova variável',
    empty: 'Nenhuma variável cadastrada.'
  };

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    isActive: true
  });

  protected readonly recordSubtitle = (record: Variable): string => record.description ?? 'Sem descrição';

  constructor() {
    super({ backLink: '/configuracoes', backLabel: 'Voltar para configuracoes', sectionLabel: 'Cadastros base' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<Variable[]> {
    return this.masterDataService.listVariables();
  }

  protected createRecord(): Observable<Variable> {
    return this.masterDataService.createVariable(this.form.getRawValue() as CreateVariableInput);
  }

  protected updateRecord(id: string): Observable<Variable> {
    return this.masterDataService.updateVariable(id, this.form.getRawValue());
  }

  protected updateStatus(record: Variable, isActive: boolean): Observable<Variable> {
    return this.masterDataService.updateVariable(record.id, { isActive });
  }

  protected deleteRecordRequest(record: Variable): Observable<Variable> {
    return this.masterDataService.deleteVariable(record.id);
  }

  protected resetForm(record?: Variable | null): void {
    this.form.reset({ name: record?.name ?? '', description: record?.description ?? '', isActive: record?.isActive ?? true });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }
}
