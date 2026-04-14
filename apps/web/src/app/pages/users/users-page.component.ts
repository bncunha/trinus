import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AuthUser, CreateUserInput, UserRole } from '@trinus/contracts';
import { UsersService } from '../../services-api/users.service';
import { FormFieldErrorComponent } from '../../shared/form-field-error.component';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule],
  templateUrl: './users-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent implements OnInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly usersService = inject(UsersService);

  protected errorMessage = '';
  protected successMessage = '';
  protected isLoading = false;
  protected isSaving = false;
  protected users: AuthUser[] = [];
  protected readonly roleLabels = {
    ADMIN: 'Administrador',
    MANAGER: 'Gestor',
    OPERATOR: 'Operador'
  } as const;
  protected readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['MANAGER' as UserRole, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  protected createUser(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.errorMessage = 'Corrija os dados do usuário antes de salvar.';
      return;
    }

    this.isSaving = true;
    const value = this.userForm.getRawValue();
    const request: CreateUserInput = {
      name: value.name,
      email: value.email,
      role: value.role,
      password: value.password,
      isActive: value.isActive
    };

    this.usersService.createUser(request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user) => {
        this.users = [...this.users, user].sort((left, right) => left.name.localeCompare(right.name));
        this.successMessage = 'Usuário criado com sucesso.';
        this.isSaving = false;
        this.userForm.reset({
          name: '',
          email: '',
          role: 'MANAGER',
          password: '',
          isActive: true
        });
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível criar o usuário.';
        this.isSaving = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private loadUsers(): void {
    this.errorMessage = '';
    this.isLoading = true;
    this.usersService.listUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar os usuários.';
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}
