import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SharedListComponent } from '../../../shared/shared-list/shared-list.component';
import type { CrudPageConfig, CrudRecord } from '../master-data-crud-page.base';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-crud-page-shell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedListComponent],
  templateUrl: './crud-page-shell.component.html',
  styleUrl: './crud-page-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrudPageShellComponent<TRecord extends CrudRecord> {
  private readonly formBuilder = inject(FormBuilder);

  @Input({ required: true }) config!: CrudPageConfig;
  @Input() backLink = '/configuracoes';
  @Input() backLabel = 'Voltar';
  @Input() sectionLabel = 'Cadastros base';
  @Input() records: TRecord[] = [];
  @Input() isLoading = false;
  @Input() isDrawerOpen = false;
  @Input() editingRecord: TRecord | null = null;
  @Input() openedActionsRecordId = '';
  @Input() recordSubtitle: (record: TRecord) => string = () => '';

  @Output() createClicked = new EventEmitter<void>();
  @Output() editClicked = new EventEmitter<TRecord>();
  @Output() statusClicked = new EventEmitter<TRecord>();
  @Output() deleteClicked = new EventEmitter<TRecord>();
  @Output() toggleActionsMenu = new EventEmitter<string>();
  @Output() closeActionsMenu = new EventEmitter<void>();
  @Output() closeDrawer = new EventEmitter<void>();

  protected readonly filterForm = this.formBuilder.nonNullable.group({
    search: '',
    status: 'ALL' as StatusFilter
  });

  protected get filteredRecords(): TRecord[] {
    const filters = this.filterForm.getRawValue();
    const search = this.normalize(filters.search);

    return this.records.filter((record) => {
      const matchesSearch = !search || this.normalize(`${record.name} ${this.recordSubtitle(record)}`).includes(search);
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

  protected clearFilters(): void {
    this.filterForm.reset({ search: '', status: 'ALL' });
  }

  private normalize(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
