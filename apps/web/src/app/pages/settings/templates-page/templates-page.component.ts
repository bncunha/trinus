import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateTemplateInput, Stage, Template } from '@trinus/contracts';
import { Observable, forkJoin, map } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { SearchableSelectComponent, type SearchableSelectOption } from '../../../shared/searchable-select/searchable-select.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';
import { activeOrSelected, toOptions } from '../master-data-options';

@Component({
  selector: 'app-templates-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule, SearchableSelectComponent],
  templateUrl: './templates-page.component.html',
  styleUrl: './templates-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplatesPageComponent extends MasterDataCrudPageBase<Template> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Templates de produção',
    description: 'Monte fluxos recorrentes com etapas em ordem.',
    createLabel: 'Novo template',
    empty: 'Nenhum template cadastrado.'
  };

  protected stages: Stage[] = [];
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    isActive: true,
    items: this.formBuilder.array([this.createTemplateItemGroup()])
  });

  protected readonly recordSubtitle = (record: Template): string => `${record.items.length} etapas`;

  protected get templateItems(): FormArray {
    return this.form.controls.items;
  }

  constructor() {
    super({ backLink: '/configuracoes', backLabel: 'Voltar para configuracoes', sectionLabel: 'Cadastros base' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<Template[]> {
    return forkJoin({
      stages: this.masterDataService.listStages(),
      templates: this.masterDataService.listTemplates()
    }).pipe(
      map(({ stages, templates }) => {
        this.stages = stages;
        return templates;
      })
    );
  }

  protected createRecord(): Observable<Template> {
    return this.masterDataService.createTemplate(this.normalizeInput());
  }

  protected updateRecord(id: string): Observable<Template> {
    return this.masterDataService.updateTemplate(id, this.normalizeInput());
  }

  protected updateStatus(record: Template, isActive: boolean): Observable<Template> {
    return this.masterDataService.updateTemplate(record.id, { isActive });
  }

  protected deleteRecordRequest(record: Template): Observable<Template> {
    return this.masterDataService.deleteTemplate(record.id);
  }

  protected resetForm(record?: Template | null): void {
    this.templateItems.clear();
    const items = record?.items.length ? record.items : [{ stageId: '', position: 0 }];
    for (const item of items) {
      this.templateItems.push(this.createTemplateItemGroup(item.stageId, item.position));
    }
    this.form.reset({ name: record?.name ?? '', description: record?.description ?? '', isActive: record?.isActive ?? true });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
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

  protected stageOptionsFor(stageId: string): SearchableSelectOption[] {
    return toOptions(activeOrSelected(this.stages, stageId));
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

  private normalizeInput(): CreateTemplateInput {
    const value = this.form.getRawValue();
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
}
