import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { ClothingSize, CreateClothingSizeInput } from '@trinus/contracts';
import type { Observable } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';

@Component({
  selector: 'app-sizes-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule],
  templateUrl: './sizes-page.component.html',
  styleUrl: './sizes-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SizesPageComponent extends MasterDataCrudPageBase<ClothingSize> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Tamanhos',
    description: 'Cadastre tamanhos usados nos itens dos pedidos.',
    createLabel: 'Novo tamanho',
    empty: 'Nenhum tamanho cadastrado.'
  };

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    position: [0, [Validators.required, Validators.min(0)]],
    isActive: true
  });

  protected readonly recordSubtitle = (): string => 'Tamanho de vestuario';

  constructor() {
    super({ backLink: '/configuracoes', backLabel: 'Voltar para configuracoes', sectionLabel: 'Cadastros base' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<ClothingSize[]> {
    return this.masterDataService.listSizes();
  }

  protected createRecord(): Observable<ClothingSize> {
    return this.masterDataService.createSize(this.normalizeInput());
  }

  protected updateRecord(id: string): Observable<ClothingSize> {
    return this.masterDataService.updateSize(id, this.normalizeInput());
  }

  protected updateStatus(record: ClothingSize, isActive: boolean): Observable<ClothingSize> {
    return this.masterDataService.updateSize(record.id, { isActive });
  }

  protected deleteRecordRequest(record: ClothingSize): Observable<ClothingSize> {
    return this.masterDataService.deleteSize(record.id);
  }

  protected resetForm(record?: ClothingSize | null): void {
    this.form.reset({ name: record?.name ?? '', position: record?.position ?? 0, isActive: record?.isActive ?? true });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }

  private normalizeInput(): CreateClothingSizeInput {
    const value = this.form.getRawValue();
    return { name: value.name, position: Number(value.position), isActive: value.isActive };
  }
}
