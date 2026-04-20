import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateStageInput, MeasurementUnit, Sector, Stage, Variable } from '@trinus/contracts';
import { Observable, forkJoin, map } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { SearchableSelectComponent, type SearchableSelectOption } from '../../../shared/searchable-select/searchable-select.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';
import { activeOrSelected, toOptions } from '../master-data-options';

@Component({
  selector: 'app-stages-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule, SearchableSelectComponent],
  templateUrl: './stages-page.component.html',
  styleUrl: './stages-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StagesPageComponent extends MasterDataCrudPageBase<Stage> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Etapas',
    description: 'Defina atividades, capacidade por dia útil e vínculos produtivos.',
    createLabel: 'Nova etapa',
    empty: 'Nenhuma etapa cadastrada.'
  };

  protected sectors: Sector[] = [];
  protected units: MeasurementUnit[] = [];
  protected variables: Variable[] = [];
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    sectorId: ['', [Validators.required]],
    measurementUnitId: ['', [Validators.required]],
    capacityPerWorkday: [1, [Validators.required, Validators.min(0.01)]],
    variableId: '',
    position: 0,
    isActive: true
  });

  protected readonly recordSubtitle = (record: Stage): string => {
    const sector = this.sectors.find((item) => item.id === record.sectorId)?.name ?? 'Setor';
    const unit = this.units.find((item) => item.id === record.measurementUnitId)?.code ?? 'un';
    return `${sector} · ${record.capacityPerWorkday} ${unit}/dia útil`;
  };

  protected get sectorOptions(): SearchableSelectOption[] {
    return toOptions(activeOrSelected(this.sectors, this.form.controls.sectorId.value));
  }

  protected get unitOptions(): SearchableSelectOption[] {
    return activeOrSelected(this.units, this.form.controls.measurementUnitId.value).map((unit) => ({
      value: unit.id,
      label: `${unit.name} (${unit.code})`
    }));
  }

  protected get variableOptions(): SearchableSelectOption[] {
    return toOptions(activeOrSelected(this.variables, this.form.controls.variableId.value), 'Nenhuma');
  }

  constructor() {
    super({ backLink: '/configuracoes', backLabel: 'Voltar para configuracoes', sectionLabel: 'Cadastros base' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<Stage[]> {
    return forkJoin({
      sectors: this.masterDataService.listSectors(),
      units: this.masterDataService.listMeasurementUnits(),
      variables: this.masterDataService.listVariables(),
      stages: this.masterDataService.listStages()
    }).pipe(
      map(({ sectors, units, variables, stages }) => {
        this.sectors = sectors;
        this.units = units;
        this.variables = variables;
        return stages;
      })
    );
  }

  protected createRecord(): Observable<Stage> {
    return this.masterDataService.createStage(this.normalizeInput());
  }

  protected updateRecord(id: string): Observable<Stage> {
    return this.masterDataService.updateStage(id, this.normalizeInput());
  }

  protected updateStatus(record: Stage, isActive: boolean): Observable<Stage> {
    return this.masterDataService.updateStage(record.id, { isActive });
  }

  protected deleteRecordRequest(record: Stage): Observable<Stage> {
    return this.masterDataService.deleteStage(record.id);
  }

  protected resetForm(record?: Stage | null): void {
    this.form.reset({
      name: record?.name ?? '',
      description: record?.description ?? '',
      sectorId: record?.sectorId ?? '',
      measurementUnitId: record?.measurementUnitId ?? '',
      capacityPerWorkday: record?.capacityPerWorkday ?? 1,
      variableId: record?.variableId ?? '',
      position: record?.position ?? 0,
      isActive: record?.isActive ?? true
    });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }

  private normalizeInput(): CreateStageInput {
    const value = this.form.getRawValue();
    return {
      ...value,
      variableId: value.variableId || undefined,
      capacityPerWorkday: Number(value.capacityPerWorkday),
      position: Number(value.position)
    };
  }
}
