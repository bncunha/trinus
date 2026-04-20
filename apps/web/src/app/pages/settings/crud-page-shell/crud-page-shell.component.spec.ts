import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { CrudPageShellComponent } from './crud-page-shell.component';

interface TestRecord {
  id: string;
  name: string;
  isActive: boolean;
  subtitle: string;
}

@Component({
  standalone: true,
  imports: [CrudPageShellComponent],
  template: `
    <app-crud-page-shell
      [config]="config"
      [records]="records"
      [isDrawerOpen]="isDrawerOpen"
      [editingRecord]="editingRecord"
      [openedActionsRecordId]="openedActionsRecordId"
      [recordSubtitle]="recordSubtitle"
      (createClicked)="created = true"
      (editClicked)="edited = $event"
      (statusClicked)="statusChanged = $event"
      (deleteClicked)="deleted = $event"
      (toggleActionsMenu)="openedActionsRecordId = $event"
      (closeActionsMenu)="openedActionsRecordId = ''"
      (closeDrawer)="isDrawerOpen = false"
    >
      <form crud-drawer-form>Formulario projetado</form>
    </app-crud-page-shell>
  `
})
class HostComponent {
  config = {
    title: 'Tamanhos',
    description: 'Cadastre tamanhos.',
    createLabel: 'Novo tamanho',
    empty: 'Nenhum tamanho cadastrado.'
  };
  records: TestRecord[] = [
    { id: '1', name: 'P', isActive: true, subtitle: 'Pequeno' },
    { id: '2', name: 'GG', isActive: false, subtitle: 'Grande' }
  ];
  isDrawerOpen = false;
  editingRecord: TestRecord | null = null;
  openedActionsRecordId = '';
  created = false;
  edited: TestRecord | null = null;
  statusChanged: TestRecord | null = null;
  deleted: TestRecord | null = null;

  recordSubtitle = (record: TestRecord) => record.subtitle;
}

describe('CrudPageShellComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders records and filters by search', () => {
    expect(fixture.nativeElement.textContent).toContain('P');
    expect(fixture.nativeElement.textContent).toContain('GG');

    const searchInput = fixture.debugElement.query(By.css('input[type="search"]')).nativeElement as HTMLInputElement;
    searchInput.value = 'pequeno';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('P');
    expect(fixture.nativeElement.textContent).not.toContain('GG');
  });

  it('emits item actions from the menu', () => {
    fixture.debugElement.query(By.css('button[aria-label="Mais opcoes"]')).nativeElement.click();
    fixture.detectChanges();

    const menuItems = fixture.debugElement.queryAll(By.css('[role="menuitem"]'));
    menuItems[0].nativeElement.click();
    menuItems[1].nativeElement.click();
    menuItems[2].nativeElement.click();

    expect(fixture.componentInstance.edited?.id).toBe('1');
    expect(fixture.componentInstance.statusChanged?.id).toBe('1');
    expect(fixture.componentInstance.deleted?.id).toBe('1');
  });

  it('projects drawer content when opened', () => {
    fixture.componentInstance.isDrawerOpen = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Formulario projetado');
    fixture.debugElement.query(By.css('button[aria-label="Fechar formulário"]')).nativeElement.click();

    expect(fixture.componentInstance.isDrawerOpen).toBe(false);
  });
});
