import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { SearchableSelectComponent, type SearchableSelectOption } from './searchable-select.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SearchableSelectComponent],
  template: `
    <app-searchable-select
      ariaLabel="Etapa"
      placeholder="Selecione"
      searchPlaceholder="Filtrar etapas"
      [options]="options"
      [formControl]="control"
    />
  `
})
class HostComponent {
  control = new FormControl('');
  options: SearchableSelectOption[] = [
    { value: 'cut', label: 'Corte' },
    { value: 'sew', label: 'Costura' },
    { value: 'finish', label: 'Acabamento' }
  ];
}

describe('SearchableSelectComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('filters options inside the popup and updates the form control', () => {
    fixture.debugElement.query(By.css('button[role="combobox"]')).nativeElement.click();
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('input[type="search"]')).nativeElement as HTMLInputElement;
    searchInput.value = 'cost';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('[role="option"]'));
    expect(options).toHaveLength(1);
    expect(options[0].nativeElement.textContent.trim()).toBe('Costura');

    options[0].nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('sew');
    expect(fixture.debugElement.query(By.css('button[role="combobox"]')).nativeElement.textContent).toContain('Costura');
  });

  it('shows an empty state when no option matches', () => {
    fixture.debugElement.query(By.css('button[role="combobox"]')).nativeElement.click();
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.css('input[type="search"]')).nativeElement as HTMLInputElement;
    searchInput.value = 'xyz';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.debugElement.queryAll(By.css('[role="option"]'))).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Nenhuma opção encontrada.');
  });
});
