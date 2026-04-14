import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { LoginInput } from '@trinus/contracts';
import { AuthService } from '../../services-api/auth.service';
import { FormFieldErrorComponent } from '../../shared/form-field-error.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected errorMessage = '';
  protected isAuthenticating = false;
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('sessionError')) {
      this.errorMessage = 'Não foi possível verificar sua sessão. Tente novamente.';
    }

    if (this.authService.currentSession) {
      void this.router.navigateByUrl(this.getHomePathForCurrentSession());
    }
  }

  protected login(): void {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Informe e-mail e senha para entrar.';
      return;
    }

    this.isAuthenticating = true;
    const value = this.loginForm.getRawValue();
    const request: LoginInput = {
      email: value.email,
      password: value.password
    };

    this.authService.login(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isAuthenticating = false;
        this.changeDetectorRef.markForCheck();
        void this.router.navigateByUrl(this.getHomePathForCurrentSession());
      },
      error: () => {
        this.isAuthenticating = false;
        this.errorMessage = 'Credenciais inválidas.';
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private getHomePathForCurrentSession(): string {
    return this.authService.currentSession?.user.role === 'OPERATOR' ? '/minha-execucao' : '/dashboard';
  }
}
