import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateMeasurementUnitInput, MeasurementUnit } from '@trinus/contracts';
import type { Observable } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';

@Component({
  selector: 'app-measurement-units-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule],
  templateUrl: './measurement-units-page.component.html',
  styleUrl: './measurement-units-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeasurementUnitsPageComponent extends MasterDataCrudPageBase<MeasurementUnit> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Unidades de medida',
    description: 'Configure as siglas usadas em etapas e capacidades.',
    createLabel: 'Nova unidade',
    empty: 'Nenhuma unidade cadastrada.'
  };

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    code: ['', [Validators.required, Validators.maxLength(12)]],
    isActive: true
  });

  protected readonly recordSubtitle = (record: MeasurementUnit): string => `Sigla: ${record.code}`;

  constructor() {
    super({ backLink: '/configuracoes', backLabel: 'Voltar para configuracoes', sectionLabel: 'Cadastros base' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<MeasurementUnit[]> {
    return this.masterDataService.listMeasurementUnits();
  }

  protected createRecord(): Observable<MeasurementUnit> {
    return this.masterDataService.createMeasurementUnit(this.form.getRawValue() as CreateMeasurementUnitInput);
  }

  protected updateRecord(id: string): Observable<MeasurementUnit> {
    return this.masterDataService.updateMeasurementUnit(id, this.form.getRawValue());
  }

  protected updateStatus(record: MeasurementUnit, isActive: boolean): Observable<MeasurementUnit> {
    return this.masterDataService.updateMeasurementUnit(record.id, { isActive });
  }

  protected deleteRecordRequest(record: MeasurementUnit): Observable<MeasurementUnit> {
    return this.masterDataService.deleteMeasurementUnit(record.id);
  }

  protected resetForm(record?: MeasurementUnit | null): void {
    this.form.reset({ name: record?.name ?? '', code: record?.code ?? '', isActive: record?.isActive ?? true });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }
}
