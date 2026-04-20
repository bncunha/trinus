import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import type { CreateSectorInput, Sector } from '@trinus/contracts';
import type { Observable } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { CrudPageShellComponent } from '../crud-page-shell/crud-page-shell.component';
import { MasterDataCrudPageBase, type CrudPageConfig } from '../master-data-crud-page.base';

@Component({
  selector: 'app-sectors-page',
  standalone: true,
  imports: [CommonModule, CrudPageShellComponent, FormFieldErrorComponent, ReactiveFormsModule],
  templateUrl: './sectors-page.component.html',
  styleUrl: './sectors-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SectorsPageComponent extends MasterDataCrudPageBase<Sector> implements OnInit {
  private readonly masterDataService = inject(MasterDataService);

  protected readonly config: CrudPageConfig = {
    title: 'Setores',
    description: 'Organize as áreas produtivas da empresa.',
    createLabel: 'Novo setor',
    empty: 'Nenhum setor cadastrado.'
  };

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.maxLength(160)]],
    isActive: true
  });

  protected readonly recordSubtitle = (record: Sector): string => record.description ?? 'Sem descrição';

  constructor() {
    super({ backLink: '/configuracoes', backLabel: 'Voltar para configuracoes', sectionLabel: 'Cadastros base' });
  }

  ngOnInit(): void {
    this.loadData();
  }

  protected fetchRecords(): Observable<Sector[]> {
    return this.masterDataService.listSectors();
  }

  protected createRecord(): Observable<Sector> {
    return this.masterDataService.createSector(this.form.getRawValue() as CreateSectorInput);
  }

  protected updateRecord(id: string): Observable<Sector> {
    return this.masterDataService.updateSector(id, this.form.getRawValue());
  }

  protected updateStatus(record: Sector, isActive: boolean): Observable<Sector> {
    return this.masterDataService.updateSector(record.id, { isActive });
  }

  protected deleteRecordRequest(record: Sector): Observable<Sector> {
    return this.masterDataService.deleteSector(record.id);
  }

  protected resetForm(record?: Sector | null): void {
    this.form.reset({ name: record?.name ?? '', description: record?.description ?? '', isActive: record?.isActive ?? true });
  }

  protected isFormInvalid(): boolean {
    return this.form.invalid;
  }

  protected markFormTouched(): void {
    this.form.markAllAsTouched();
  }
}
