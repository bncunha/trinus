import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type {
  CreateMeasurementUnitInput,
  CreateSectorInput,
  CreateStageInput,
  CreateTemplateInput,
  CreateVariableInput,
  MeasurementUnit,
  Sector,
  Stage,
  Template,
  Variable
} from '@trinus/contracts';
import { Observable, forkJoin } from 'rxjs';
import { MasterDataService } from '../../services-api/master-data.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog.service';
import { FormFieldErrorComponent } from '../../shared/form-field-error.component';
import { SharedListComponent } from '../../shared/shared-list.component';
import { ToastService } from '../../shared/toast.service';

type MasterDataKind = 'measurement-units' | 'variables' | 'sectors' | 'stages' | 'templates';
type MasterDataRecord = MeasurementUnit | Variable | Sector | Stage | Template;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const PAGE_CONFIG: Record<MasterDataKind, { title: string; description: string; createLabel: string; empty: string }> = {
  'measurement-units': {
    title: 'Unidades de medida',
    description: 'Configure as siglas usadas em etapas e capacidades.',
    createLabel: 'Nova unidade',
    empty: 'Nenhuma unidade cadastrada.'
  },
  variables: {
    title: 'Variáveis',
    description: 'Cadastre parâmetros numéricos simples usados em etapas e pedidos.',
    createLabel: 'Nova variável',
    empty: 'Nenhuma variável cadastrada.'
  },
  sectors: {
    title: 'Setores',
    description: 'Organize as áreas produtivas da empresa.',
    createLabel: 'Novo setor',
    empty: 'Nenhum setor cadastrado.'
  },
  stages: {
    title: 'Etapas',
    description: 'Defina atividades, capacidade por dia útil e vínculos produtivos.',
    createLabel: 'Nova etapa',
    empty: 'Nenhuma etapa cadastrada.'
  },
  templates: {
    title: 'Templates de produção',
    description: 'Monte fluxos recorrentes com etapas em ordem.',
    createLabel: 'Novo template',
    empty: 'Nenhum template cadastrado.'
  }
};

@Component({
  selector: 'app-master-data-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule, RouterLink, SharedListComponent],
  templateUrl: './master-data-page.component.html',
  styleUrl: './master-data-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MasterDataPageComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly masterDataService = inject(MasterDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ToastService);

  protected kind: MasterDataKind = 'measurement-units';
  protected config = PAGE_CONFIG[this.kind];
  protected records: MasterDataRecord[] = [];
  protected units: MeasurementUnit[] = [];
  protected variables: Variable[] = [];
  protected sectors: Sector[] = [];
  protected stages: Stage[] = [];
  protected isLoading = false;
  protected isSaving = false;
  protected isDrawerOpen = false;
  protected editingRecord: MasterDataRecord | null = null;
  protected readonly filterForm = this.formBuilder.nonNullable.group({
    search: '',
    status: 'ALL' as StatusFilter
  });
  protected readonly unitForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    code: ['', [Validators.required, Validators.maxLength(12)]],
    isActive: true
  });
  protected readonly variableForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    isActive: true
  });
  protected readonly sectorForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    isActive: true
  });
  protected readonly stageForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    sectorId: ['', [Validators.required]],
    measurementUnitId: ['', [Validators.required]],
    capacityPerWorkday: [1, [Validators.required, Validators.min(0.01)]],
    variableId: '',
    position: 0,
    isActive: true
  });
  protected readonly templateForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    isActive: true,
    items: this.formBuilder.array([this.createTemplateItemGroup()])
  });

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.kind = data['kind'] as MasterDataKind;
      this.config = PAGE_CONFIG[this.kind];
      this.closeDrawer();
      this.loadData();
    });
  }

  protected get templateItems(): FormArray {
    return this.templateForm.controls.items;
  }

  protected get filteredRecords(): MasterDataRecord[] {
    const filters = this.filterForm.getRawValue();
    const search = this.normalize(filters.search);

    return this.records.filter((record) => {
      const matchesSearch = !search || this.normalize(this.recordSearch(record)).includes(search);
      const matchesStatus =
        filters.status === 'ALL' ||
        (filters.status === 'ACTIVE' && record.isActive) ||
        (filters.status === 'INACTIVE' && !record.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  protected get resultSummary(): string {
    const count = this.filteredRecords.length;
    const noun = count === 1 ? 'registro' : 'registros';
    const suffix = this.hasActiveFilters ? (count === 1 ? 'encontrado' : 'encontrados') : 'cadastrados';

    return `${count} ${noun} ${suffix}`;
  }

  protected get hasActiveFilters(): boolean {
    const filters = this.filterForm.getRawValue();
    return Boolean(filters.search.trim()) || filters.status !== 'ALL';
  }

  protected get activeFormInvalid(): boolean {
    if (this.kind === 'measurement-units') return this.unitForm.invalid;
    if (this.kind === 'variables') return this.variableForm.invalid;
    if (this.kind === 'sectors') return this.sectorForm.invalid;
    if (this.kind === 'stages') return this.stageForm.invalid;
    return this.templateForm.invalid;
  }

  protected get selectableSectors(): Sector[] {
    return this.activeOrSelected(this.sectors, this.stageForm.controls.sectorId.value);
  }

  protected get selectableUnits(): MeasurementUnit[] {
    return this.activeOrSelected(this.units, this.stageForm.controls.measurementUnitId.value);
  }

  protected get selectableVariables(): Variable[] {
    return this.activeOrSelected(this.variables, this.stageForm.controls.variableId.value);
  }

  protected selectableStagesFor(stageId: string): Stage[] {
    return this.activeOrSelected(this.stages, stageId);
  }

  protected clearFilters(): void {
    this.filterForm.reset({ search: '', status: 'ALL' });
  }

  protected openCreateDrawer(): void {
    this.editingRecord = null;
    this.resetActiveForm();
    this.isDrawerOpen = true;
  }

  protected openEditDrawer(record: MasterDataRecord): void {
    this.editingRecord = record;
    this.resetActiveForm(record);
    this.isDrawerOpen = true;
  }

  protected closeDrawer(): void {
    if (this.isSaving) {
      return;
    }

    this.isDrawerOpen = false;
    this.editingRecord = null;
  }

  protected addTemplateItem(): void {
    this.templateItems.push(this.createTemplateItemGroup());
  }

  protected removeTemplateItem(index: number): void {
    if (this.templateItems.length <= 1) {
      this.templateItems.at(0).reset({ stageId: '' });
      return;
    }

    this.templateItems.removeAt(index);
    this.templateItems.markAsDirty();
  }

  protected moveTemplateItemUp(index: number): void {
    this.moveTemplateItem(index, index - 1);
  }

  protected moveTemplateItemDown(index: number): void {
    this.moveTemplateItem(index, index + 1);
  }

  protected submitFromKeyboard(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    const target = keyboardEvent.target as HTMLElement | null;

    if (target?.tagName === 'TEXTAREA') {
      return;
    }

    keyboardEvent.preventDefault();
    this.save();
  }

  protected save(): void {
    if (this.activeFormInvalid) {
      this.markActiveFormTouched();
      this.toastService.warning('Corrija os dados', 'Corrija os dados do cadastro antes de salvar.');
      return;
    }

    this.isSaving = true;
    const request = this.editingRecord ? this.updateCurrentRecord() : this.createCurrentRecord();

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (record) => {
        this.upsertRecord(record);
        this.toastService.success('Cadastro salvo', 'Cadastro salvo com sucesso.');
        this.isSaving = false;
        this.closeDrawer();
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.toastService.danger('Erro ao salvar', 'Não foi possível salvar o cadastro.');
        this.isSaving = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected deactivate(record: MasterDataRecord): void {
    this.confirmDialogService.open({
      title: 'Inativar cadastro?',
      message: 'O registro deixará de aparecer como opção ativa nos novos fluxos.',
      confirmLabel: 'Inativar',
      onConfirm: () => {
        this.deleteCurrentRecord(record).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (updatedRecord) => {
            this.upsertRecord(updatedRecord);
            this.toastService.success('Cadastro inativado', 'Cadastro inativado com sucesso.');
            this.changeDetectorRef.markForCheck();
          },
          error: () => {
            this.toastService.danger('Erro ao inativar', 'Não foi possível inativar o cadastro.');
            this.changeDetectorRef.markForCheck();
          }
        });
      }
    });
  }

  protected recordSubtitle(record: MasterDataRecord): string {
    if (this.kind === 'measurement-units') {
      return `Sigla: ${(record as MeasurementUnit).code}`;
    }

    if (this.kind === 'stages') {
      const stage = record as Stage;
      const sector = this.sectors.find((item) => item.id === stage.sectorId)?.name ?? 'Setor';
      const unit = this.units.find((item) => item.id === stage.measurementUnitId)?.code ?? 'un';
      return `${sector} · ${stage.capacityPerWorkday} ${unit}/dia útil`;
    }

    if (this.kind === 'templates') {
      return `${(record as Template).items.length} etapas`;
    }

    return (record as Sector | Variable).description ?? 'Sem descrição';
  }

  protected stageName(stageId: string): string {
    return this.stages.find((stage) => stage.id === stageId)?.name ?? 'Etapa';
  }

  private loadData(): void {
    this.isLoading = true;
    forkJoin({
      units: this.masterDataService.listMeasurementUnits(),
      variables: this.masterDataService.listVariables(),
      sectors: this.masterDataService.listSectors(),
      stages: this.masterDataService.listStages(),
      templates: this.masterDataService.listTemplates()
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ units, variables, sectors, stages, templates }) => {
          this.units = units;
          this.variables = variables;
          this.sectors = sectors;
          this.stages = stages;
          this.records = this.recordsForKind(units, variables, sectors, stages, templates);
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.toastService.danger('Erro ao carregar', 'Não foi possível carregar os cadastros.');
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private recordsForKind(
    units: MeasurementUnit[],
    variables: Variable[],
    sectors: Sector[],
    stages: Stage[],
    templates: Template[]
  ): MasterDataRecord[] {
    if (this.kind === 'measurement-units') return units;
    if (this.kind === 'variables') return variables;
    if (this.kind === 'sectors') return sectors;
    if (this.kind === 'stages') return stages;
    return templates;
  }

  private resetActiveForm(record?: MasterDataRecord | null): void {
    if (this.kind === 'measurement-units') {
      const unit = record as MeasurementUnit | undefined;
      this.unitForm.reset({ name: unit?.name ?? '', code: unit?.code ?? '', isActive: unit?.isActive ?? true });
    } else if (this.kind === 'variables') {
      const variable = record as Variable | undefined;
      this.variableForm.reset({
        name: variable?.name ?? '',
        description: variable?.description ?? '',
        isActive: variable?.isActive ?? true
      });
    } else if (this.kind === 'sectors') {
      const sector = record as Sector | undefined;
      this.sectorForm.reset({
        name: sector?.name ?? '',
        description: sector?.description ?? '',
        isActive: sector?.isActive ?? true
      });
    } else if (this.kind === 'stages') {
      const stage = record as Stage | undefined;
      this.stageForm.reset({
        name: stage?.name ?? '',
        description: stage?.description ?? '',
        sectorId: stage?.sectorId ?? '',
        measurementUnitId: stage?.measurementUnitId ?? '',
        capacityPerWorkday: stage?.capacityPerWorkday ?? 1,
        variableId: stage?.variableId ?? '',
        position: stage?.position ?? 0,
        isActive: stage?.isActive ?? true
      });
    } else {
      const template = record as Template | undefined;
      this.templateItems.clear();
      const items = template?.items.length ? template.items : [{ stageId: '', position: 0 }];
      for (const item of items) {
        this.templateItems.push(this.createTemplateItemGroup(item.stageId, item.position));
      }
      this.templateForm.reset({
        name: template?.name ?? '',
        description: template?.description ?? '',
        isActive: template?.isActive ?? true
      });
    }
  }

  private createCurrentRecord(): Observable<MasterDataRecord> {
    if (this.kind === 'measurement-units') {
      return this.masterDataService.createMeasurementUnit(this.unitForm.getRawValue() as CreateMeasurementUnitInput);
    }

    if (this.kind === 'variables') {
      return this.masterDataService.createVariable(this.variableForm.getRawValue() as CreateVariableInput);
    }

    if (this.kind === 'sectors') {
      return this.masterDataService.createSector(this.sectorForm.getRawValue() as CreateSectorInput);
    }

    if (this.kind === 'stages') {
      return this.masterDataService.createStage(this.normalizeStageInput());
    }

    return this.masterDataService.createTemplate(this.normalizeTemplateInput());
  }

  private updateCurrentRecord(): Observable<MasterDataRecord> {
    const id = this.editingRecord?.id ?? '';

    if (this.kind === 'measurement-units') {
      return this.masterDataService.updateMeasurementUnit(id, this.unitForm.getRawValue());
    }

    if (this.kind === 'variables') {
      return this.masterDataService.updateVariable(id, this.variableForm.getRawValue());
    }

    if (this.kind === 'sectors') {
      return this.masterDataService.updateSector(id, this.sectorForm.getRawValue());
    }

    if (this.kind === 'stages') {
      return this.masterDataService.updateStage(id, this.normalizeStageInput());
    }

    return this.masterDataService.updateTemplate(id, this.normalizeTemplateInput());
  }

  private deleteCurrentRecord(record: MasterDataRecord): Observable<MasterDataRecord> {
    if (this.kind === 'measurement-units') return this.masterDataService.deleteMeasurementUnit(record.id);
    if (this.kind === 'variables') return this.masterDataService.deleteVariable(record.id);
    if (this.kind === 'sectors') return this.masterDataService.deleteSector(record.id);
    if (this.kind === 'stages') return this.masterDataService.deleteStage(record.id);
    return this.masterDataService.deleteTemplate(record.id);
  }

  private normalizeStageInput(): CreateStageInput {
    const value = this.stageForm.getRawValue();

    return {
      ...value,
      variableId: value.variableId || undefined,
      capacityPerWorkday: Number(value.capacityPerWorkday),
      position: Number(value.position)
    };
  }

  private normalizeTemplateInput(): CreateTemplateInput {
    const value = this.templateForm.getRawValue();

    return {
      name: value.name,
      description: value.description,
      isActive: value.isActive,
      items: value.items
        .filter((item) => item.stageId)
        .map((item, index) => ({
          stageId: item.stageId,
          position: index
        }))
    };
  }

  private upsertRecord(record: MasterDataRecord): void {
    const existing = this.records.some((item) => item.id === record.id);
    this.records = existing
      ? this.records.map((item) => (item.id === record.id ? record : item))
      : [...this.records, record];
  }

  private markActiveFormTouched(): void {
    if (this.kind === 'measurement-units') this.unitForm.markAllAsTouched();
    else if (this.kind === 'variables') this.variableForm.markAllAsTouched();
    else if (this.kind === 'sectors') this.sectorForm.markAllAsTouched();
    else if (this.kind === 'stages') this.stageForm.markAllAsTouched();
    else this.templateForm.markAllAsTouched();
  }

  private createTemplateItemGroup(stageId = '', position = 0) {
    return this.formBuilder.nonNullable.group({
      stageId: [stageId, [Validators.required]],
      position
    });
  }

  private moveTemplateItem(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= this.templateItems.length || toIndex >= this.templateItems.length) {
      return;
    }

    const control = this.templateItems.at(fromIndex);
    this.templateItems.removeAt(fromIndex);
    this.templateItems.insert(toIndex, control);
    this.templateItems.markAsDirty();
  }

  private activeOrSelected<T extends { id: string; isActive: boolean }>(items: T[], selectedId: string | null | undefined): T[] {
    return items.filter((item) => item.isActive || item.id === selectedId);
  }

  private recordSearch(record: MasterDataRecord): string {
    return `${record.name} ${this.recordSubtitle(record)}`;
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
