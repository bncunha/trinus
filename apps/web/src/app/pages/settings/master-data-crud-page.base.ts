import { ChangeDetectorRef, DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import type { Observable } from 'rxjs';
import { ConfirmDialogService } from '../../shared/confirm-dialog.service';
import { ToastService } from '../../shared/toast.service';

export interface CrudRecord {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CrudPageConfig {
  title: string;
  description: string;
  createLabel: string;
  empty: string;
}

@Directive()
export abstract class MasterDataCrudPageBase<TRecord extends CrudRecord> {
  protected readonly changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly confirmDialogService = inject(ConfirmDialogService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly formBuilder = inject(FormBuilder);
  protected readonly toastService = inject(ToastService);

  protected records: TRecord[] = [];
  protected isLoading = false;
  protected isSaving = false;
  protected isDrawerOpen = false;
  protected editingRecord: TRecord | null = null;
  protected openedActionsRecordId = '';

  protected readonly backLink: string;
  protected readonly backLabel: string;
  protected readonly sectionLabel: string;
  protected abstract readonly config: CrudPageConfig;

  protected constructor(options: { backLink: string; backLabel: string; sectionLabel: string }) {
    this.backLink = options.backLink;
    this.backLabel = options.backLabel;
    this.sectionLabel = options.sectionLabel;
  }

  protected loadData(): void {
    this.isLoading = true;
    this.fetchRecords()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (records) => {
          this.records = records;
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

  protected openCreateDrawer(): void {
    this.editingRecord = null;
    this.resetForm();
    this.isDrawerOpen = true;
  }

  protected openEditDrawer(record: TRecord): void {
    this.editingRecord = record;
    this.resetForm(record);
    this.isDrawerOpen = true;
  }

  protected closeDrawer(): void {
    if (this.isSaving) {
      return;
    }

    this.isDrawerOpen = false;
    this.editingRecord = null;
  }

  protected toggleActionsMenu(recordId: string): void {
    this.openedActionsRecordId = this.openedActionsRecordId === recordId ? '' : recordId;
  }

  protected closeActionsMenu(): void {
    this.openedActionsRecordId = '';
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
    if (this.isFormInvalid()) {
      this.markFormTouched();
      this.toastService.warning('Corrija os dados', 'Corrija os dados do cadastro antes de salvar.');
      return;
    }

    this.isSaving = true;
    const request = this.editingRecord ? this.updateRecord(this.editingRecord.id) : this.createRecord();

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

  protected deactivate(record: TRecord): void {
    this.closeActionsMenu();
    this.confirmDialogService.open({
      title: 'Inativar cadastro?',
      message: 'O registro deixará de aparecer como opção ativa nos novos fluxos.',
      confirmLabel: 'Inativar',
      onConfirm: () => {
        this.updateStatus(record, false)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
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

  protected activate(record: TRecord): void {
    this.closeActionsMenu();
    this.updateStatus(record, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedRecord) => {
          this.upsertRecord(updatedRecord);
          this.toastService.success('Cadastro ativado', 'Cadastro ativado com sucesso.');
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.toastService.danger('Erro ao ativar', 'Não foi possível ativar o cadastro.');
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  protected deleteRecord(record: TRecord): void {
    this.closeActionsMenu();
    this.confirmDialogService.open({
      title: 'Excluir cadastro?',
      message: 'Esta ação remove o cadastro quando ele ainda não possui dependências.',
      confirmLabel: 'Excluir',
      onConfirm: () => {
        this.deleteRecordRequest(record)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.records = this.records.filter((item) => item.id !== record.id);
              this.toastService.success('Cadastro excluido', 'Cadastro excluido com sucesso.');
              this.changeDetectorRef.markForCheck();
            },
            error: () => {
              this.toastService.danger('Erro ao excluir', 'Não foi possível excluir o cadastro. Verifique se ele está sendo usado.');
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });
  }

  protected toggleStatus(record: TRecord): void {
    record.isActive ? this.deactivate(record) : this.activate(record);
  }

  protected upsertRecord(record: TRecord): void {
    const existing = this.records.some((item) => item.id === record.id);
    this.records = existing ? this.records.map((item) => (item.id === record.id ? record : item)) : [...this.records, record];
  }

  protected abstract fetchRecords(): Observable<TRecord[]>;
  protected abstract createRecord(): Observable<TRecord>;
  protected abstract updateRecord(id: string): Observable<TRecord>;
  protected abstract updateStatus(record: TRecord, isActive: boolean): Observable<TRecord>;
  protected abstract deleteRecordRequest(record: TRecord): Observable<TRecord>;
  protected abstract resetForm(record?: TRecord | null): void;
  protected abstract isFormInvalid(): boolean;
  protected abstract markFormTouched(): void;
}
