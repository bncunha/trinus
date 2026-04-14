import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from './form-field-error.component';

describe('FormFieldErrorComponent', () => {
  let fixture: ComponentFixture<FormFieldErrorComponent>;
  let component: FormFieldErrorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldErrorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldErrorComponent);
    component = fixture.componentInstance;
  });

  it('shows the required message for touched empty controls', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Campo obrigatório.');
  });

  it('shows the standardized email message', () => {
    const control = new FormControl('email-invalido', Validators.email);
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('E-mail inválido.');
  });

  it('supports custom validation messages', () => {
    const control = new FormControl(0);
    control.setErrors({ minValue: { min: 0 } });
    control.markAsTouched();
    component.control = control;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Valor deve ser maior que 0.');
  });
});
