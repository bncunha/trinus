import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { AuthUser, CreateUserInput, UpdateUserInput, UserRole } from '@trinus/contracts';
import { AuthService } from '../../../services-api/auth.service';
import { UsersService } from '../../../services-api/users.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog.service';
import { FormFieldErrorComponent } from '../../../shared/form-field-error/form-field-error.component';
import { SharedListComponent } from '../../../shared/shared-list/shared-list.component';
import { ToastService } from '../../../shared/toast.service';

type UserRoleFilter = 'ALL' | UserRole;
type UserStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormFieldErrorComponent, ReactiveFormsModule, SharedListComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly usersService = inject(UsersService);

  protected isLoading = false;
  protected isSaving = false;
  protected isDrawerOpen = false;
  protected editingUser: AuthUser | null = null;
  protected openedActionsUserId = '';
  protected deletingUserId = '';
  protected changingAccessUserId = '';
  protected users: AuthUser[] = [];
  protected readonly roleLabels = {
    ADMIN: 'Administrador',
    MANAGER: 'Gestor',
    OPERATOR: 'Operador'
  } as const;
  protected readonly filterForm = this.formBuilder.nonNullable.group({
    search: '',
    role: 'ALL' as UserRoleFilter,
    status: 'ALL' as UserStatusFilter
  });
  protected readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['MANAGER' as UserRole, [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.userForm.controls.isActive.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updatePasswordValidators();
    });
    this.loadUsers();
  }

  protected get filteredUsers(): AuthUser[] {
    const filters = this.filterForm.getRawValue();
    const search = this.normalizeSearch(filters.search);

    return this.users.filter((user) => {
      const matchesSearch =
        !search || this.normalizeSearch(`${user.name} ${user.email}`).includes(search);
      const matchesRole = filters.role === 'ALL' || user.role === filters.role;
      const matchesStatus =
        filters.status === 'ALL' ||
        (filters.status === 'ACTIVE' && user.isActive) ||
        (filters.status === 'INACTIVE' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  protected get hasActiveFilters(): boolean {
    const filters = this.filterForm.getRawValue();

    return Boolean(filters.search.trim()) || filters.role !== 'ALL' || filters.status !== 'ALL';
  }

  protected get resultSummary(): string {
    const count = this.filteredUsers.length;
    const noun = count === 1 ? 'usuário' : 'usuários';
    const suffix = this.hasActiveFilters
      ? count === 1
        ? 'encontrado'
        : 'encontrados'
      : count === 1
        ? 'cadastrado'
        : 'cadastrados';

    return `${count} ${noun} ${suffix}`;
  }

  protected clearFilters(): void {
    this.filterForm.reset({
      search: '',
      role: 'ALL',
      status: 'ALL'
    });
  }

  protected openCreateDrawer(): void {
    this.editingUser = null;
    this.userForm.controls.email.enable();
    this.userForm.reset({
      name: '',
      email: '',
      role: 'MANAGER',
      password: '',
      isActive: true
    });
    this.updatePasswordValidators();
    this.isDrawerOpen = true;
  }

  protected openEditDrawer(user: AuthUser): void {
    this.closeActionsMenu();
    this.editingUser = user;
    this.userForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      isActive: user.isActive
    });
    this.userForm.controls.email.disable();
    this.updatePasswordValidators();
    this.isDrawerOpen = true;
  }

  protected closeDrawer(): void {
    if (this.isSaving) {
      return;
    }

    this.isDrawerOpen = false;
    this.editingUser = null;
    this.userForm.controls.email.enable();
  }

  protected toggleActionsMenu(userId: string): void {
    this.openedActionsUserId = this.openedActionsUserId === userId ? '' : userId;
  }

  protected closeActionsMenu(): void {
    this.openedActionsUserId = '';
  }

  protected saveUser(): void {
    this.updatePasswordValidators();

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toastService.warning('Corrija os dados', 'Corrija os dados do usuário antes de salvar.');
      return;
    }

    if (this.editingUser && this.isCurrentUser(this.editingUser) && !this.userForm.controls.isActive.value) {
      this.toastService.warning('Ação não permitida', 'Você não pode desativar o próprio usuário.');
      this.userForm.controls.isActive.setValue(true);
      return;
    }

    if (this.editingUser && this.isOnlyActiveAdmin(this.editingUser) && this.wouldRemoveActiveAdmin()) {
      this.toastService.warning('Ação não permitida', 'A empresa precisa ter pelo menos um Administrador ativo.');
      this.userForm.patchValue({
        role: 'ADMIN',
        isActive: true
      });
      return;
    }

    if (this.editingUser) {
      this.updateUser(this.editingUser.id);
      return;
    }

    this.createUser();
  }

  protected toggleUserAccess(user: AuthUser): void {
    this.closeActionsMenu();

    if (this.isCurrentUser(user)) {
      this.toastService.warning('Ação não permitida', 'Você não pode alterar o acesso do próprio usuário.');
      return;
    }

    if (this.isOnlyActiveAdmin(user)) {
      this.toastService.warning('Ação não permitida', 'A empresa precisa ter pelo menos um Administrador ativo.');
      return;
    }

    const title = user.isActive ? 'Desativar acesso?' : 'Ativar acesso?';
    const message = user.isActive
      ? 'Este usuário não conseguirá acessar o sistema até ser ativado novamente.'
      : 'Este usuário poderá acessar o sistema novamente.';

    this.confirmDialogService.open({
      title,
      message,
      confirmLabel: user.isActive ? 'Desativar acesso' : 'Ativar acesso',
      onConfirm: () => {
        this.changingAccessUserId = user.id;
        this.usersService
          .updateUser(user.id, { isActive: !user.isActive })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (updatedUser) => {
              this.replaceUser(updatedUser);
              this.toastService.success(
                updatedUser.isActive ? 'Acesso ativado' : 'Acesso desativado',
                updatedUser.isActive ? 'Acesso ativado com sucesso.' : 'Acesso desativado com sucesso.'
              );
              this.changingAccessUserId = '';
              this.changeDetectorRef.markForCheck();
            },
            error: () => {
              this.toastService.danger('Erro ao alterar acesso', 'Não foi possível alterar o acesso do usuário.');
              this.changingAccessUserId = '';
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });
  }

  protected deleteUser(user: AuthUser): void {
    this.closeActionsMenu();

    if (this.isCurrentUser(user)) {
      this.toastService.warning('Ação não permitida', 'Você não pode excluir o próprio usuário.');
      return;
    }

    if (this.isOnlyActiveAdmin(user)) {
      this.toastService.warning('Ação não permitida', 'A empresa precisa ter pelo menos um Administrador ativo.');
      return;
    }

    this.confirmDialogService.open({
      title: 'Excluir usuário?',
      message: 'Esta ação não poderá ser desfeita.',
      confirmLabel: 'Excluir usuário',
      onConfirm: () => {
        this.deletingUserId = user.id;
        this.usersService
          .deleteUser(user.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.users = this.users.filter((item) => item.id !== user.id);
              this.toastService.success('Usuário excluído', 'Usuário excluído com sucesso.');
              this.deletingUserId = '';
              this.changeDetectorRef.markForCheck();
            },
            error: () => {
              this.toastService.danger('Erro ao excluir', 'Não foi possível excluir o usuário.');
              this.deletingUserId = '';
              this.changeDetectorRef.markForCheck();
            }
          });
      }
    });
  }

  protected isCurrentUser(user: AuthUser): boolean {
    return user.id === this.authService.currentSession?.user.id;
  }

  protected isOnlyActiveAdmin(user: AuthUser): boolean {
    return user.role === 'ADMIN' && user.isActive && this.activeAdminCount() <= 1;
  }

  private createUser(): void {
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
        this.toastService.success('Usuário criado', 'Usuário criado com sucesso.');
        this.isSaving = false;
        this.closeDrawer();
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.toastService.danger('Erro ao criar usuário', 'Não foi possível criar o usuário.');
        this.isSaving = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private updateUser(userId: string): void {
    this.isSaving = true;
    const value = this.userForm.getRawValue();
    const request: UpdateUserInput = {
      name: value.name,
      role: value.role,
      isActive: value.isActive
    };

    if (value.password.trim()) {
      request.password = value.password;
    }

    this.usersService.updateUser(userId, request).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user) => {
        this.replaceUser(user);
        this.toastService.success('Alterações salvas', 'Alterações salvas com sucesso.');
        this.isSaving = false;
        this.closeDrawer();
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.toastService.danger('Erro ao salvar alterações', 'Não foi possível salvar as alterações.');
        this.isSaving = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.usersService.listUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.toastService.danger('Erro ao carregar usuários', 'Não foi possível carregar os usuários. Tente novamente.');
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  private replaceUser(user: AuthUser): void {
    this.users = this.users
      .map((item) => (item.id === user.id ? user : item))
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private activeAdminCount(): number {
    return this.users.filter((user) => user.role === 'ADMIN' && user.isActive).length;
  }

  private wouldRemoveActiveAdmin(): boolean {
    const value = this.userForm.getRawValue();

    return value.role !== 'ADMIN' || !value.isActive;
  }

  private updatePasswordValidators(): void {
    const passwordControl = this.userForm.controls.password;
    const shouldRequirePassword = !this.editingUser && this.userForm.controls.isActive.value;

    passwordControl.setValidators(
      shouldRequirePassword ? [Validators.required, Validators.minLength(6)] : [Validators.minLength(6)]
    );
    passwordControl.updateValueAndValidity({ emitEvent: false });
  }

  private normalizeSearch(value: string): string {
    return value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
