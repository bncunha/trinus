import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';

type ErrorMessages = Record<string, string | ((error: unknown) => string)>;

const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  required: 'Campo obrigatório.',
  email: 'E-mail inválido.',
  minlength: (error) => {
    const details = error as { requiredLength?: number };

    return `Use pelo menos ${details.requiredLength ?? 1} caracteres.`;
  },
  maxlength: (error) => {
    const details = error as { requiredLength?: number };

    return `Use no máximo ${details.requiredLength ?? 1} caracteres.`;
  },
  min: (error) => {
    const details = error as { min?: number };

    return `Valor deve ser maior que ${details.min ?? 0}.`;
  },
  minValue: (error) => {
    const details = error as { min?: number };

    return `Valor deve ser maior que ${details.min ?? 0}.`;
  },
  decimalPlaces: (error) => {
    const details = error as { max?: number };

    return `Use no máximo ${details.max ?? 2} casas decimais.`;
  }
};

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <small class="orders-app__field-hint form-field-error" *ngIf="message">
      {{ message }}
    </small>
  `
})
export class FormFieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() messages: ErrorMessages = {};

  get message(): string {
    if (!this.control || !this.control.invalid || (!this.control.touched && !this.control.dirty)) {
      return '';
    }

    const errors = this.control.errors;

    if (!errors) {
      return '';
    }

    const [errorKey] = Object.keys(errors);

    return this.resolveMessage(errorKey, errors);
  }

  private resolveMessage(errorKey: string, errors: ValidationErrors): string {
    const configuredMessage = this.messages[errorKey] ?? DEFAULT_ERROR_MESSAGES[errorKey];

    if (typeof configuredMessage === 'function') {
      return configuredMessage(errors[errorKey]);
    }

    return configuredMessage ?? 'Campo inválido.';
  }
}
