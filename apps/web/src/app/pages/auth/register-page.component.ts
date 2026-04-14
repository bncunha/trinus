import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { RegisterAccountInput } from '@trinus/contracts';
import { AuthService } from '../../services-api/auth.service';
import { FormFieldErrorComponent } from '../../shared/form-field-error.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected errorMessage = '';
  protected isAuthenticating = false;
  protected readonly registerForm = this.formBuilder.nonNullable.group({
    companyName: ['', [Validators.required, Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    if (this.authService.currentSession) {
      void this.router.navigateByUrl(this.getHomePathForCurrentSession());
    }
  }

  protected registerAccount(): void {
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Preencha os dados da empresa e do administrador.';
      return;
    }

    this.isAuthenticating = true;
    const value = this.registerForm.getRawValue();
    const request: RegisterAccountInput = {
      companyName: value.companyName,
      name: value.name,
      email: value.email,
      password: value.password
    };

    this.authService.register(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isAuthenticating = false;
        this.changeDetectorRef.markForCheck();
        void this.router.navigateByUrl(this.getHomePathForCurrentSession());
      },
      error: () => {
        this.isAuthenticating = false;
        this.errorMessage = 'Não foi possível criar a conta.';
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private getHomePathForCurrentSession(): string {
    return this.authService.currentSession?.user.role === 'OPERATOR' ? '/minha-execucao' : '/dashboard';
  }
}
