import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { AuthSession, AuthUser } from '@trinus/contracts';
import { of } from 'rxjs';
import { AuthService } from '../../../services-api/auth.service';
import { UsersService } from '../../../services-api/users.service';
import { ConfirmDialogService } from '../../../shared/confirm-dialog.service';
import { ToastService } from '../../../shared/toast.service';
import { UsersPageComponent } from './users-page.component';

const users: AuthUser[] = [
  {
    id: 'user_1',
    companyId: 'company_1',
    name: 'Ana Admin',
    email: 'ana@acme.test',
    role: 'ADMIN',
    isActive: true
  },
  {
    id: 'user_2',
    companyId: 'company_1',
    name: 'Bruno Gestor',
    email: 'bruno@acme.test',
    role: 'MANAGER',
    isActive: true
  }
];

class UsersServiceStub {
  listUsers = jest.fn(() => of(users));
  createUser = jest.fn((input) => of({ ...users[1], id: 'user_3', ...input }));
  updateUser = jest.fn((userId, input) => of({ ...users.find((user) => user.id === userId), ...input }));
  deleteUser = jest.fn(() => of(undefined));
}

class AuthServiceStub {
  readonly currentSession: AuthSession = {
    user: users[0],
    company: {
      id: 'company_1',
      name: 'Acme'
    }
  };
}

class ConfirmDialogServiceStub {
  open = jest.fn();
}

class ToastServiceStub {
  success = jest.fn();
  warning = jest.fn();
  danger = jest.fn();
}

describe('UsersPageComponent', () => {
  let fixture: ComponentFixture<UsersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: ConfirmDialogService, useClass: ConfirmDialogServiceStub },
        { provide: ToastService, useClass: ToastServiceStub },
        { provide: UsersService, useClass: UsersServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();
  });

  it('exibe usuarios cadastrados', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Ana Admin');
    expect(host.textContent).toContain('Bruno Gestor');
    expect(host.textContent).toContain('Administrador');
    expect(host.textContent).toContain('Gestor');
  });

  it('filtra usuarios por nome ou e-mail', () => {
    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector<HTMLInputElement>('input[formControlName="search"]');

    searchInput!.value = 'bruno';
    searchInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.textContent).not.toContain('Ana Admin');
    expect(host.textContent).toContain('Bruno Gestor');
    expect(host.textContent).toContain('1 usuário encontrado');
  });

  it('filtra usuarios por papel e situacao', () => {
    const host = fixture.nativeElement as HTMLElement;
    const roleSelect = host.querySelector<HTMLSelectElement>('select[formControlName="role"]');
    const statusSelect = host.querySelector<HTMLSelectElement>('select[formControlName="status"]');

    roleSelect!.value = 'MANAGER';
    roleSelect!.dispatchEvent(new Event('change'));
    statusSelect!.value = 'INACTIVE';
    statusSelect!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(host.textContent).toContain('Nenhum usuário encontrado.');
    expect(host.textContent).toContain('Limpar filtros');
  });

  it('limpa filtros ativos', () => {
    const host = fixture.nativeElement as HTMLElement;
    const searchInput = host.querySelector<HTMLInputElement>('input[formControlName="search"]');

    searchInput!.value = 'ana';
    searchInput!.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    getButtonByText(host, 'Limpar filtros').click();
    fixture.detectChanges();

    expect(host.textContent).toContain('Ana Admin');
    expect(host.textContent).toContain('Bruno Gestor');
    expect(host.textContent).toContain('2 usuários cadastrados');
  });

  it('abre o drawer para criar usuario', () => {
    const host = fixture.nativeElement as HTMLElement;
    const createButton = getButtonByText(host, 'Novo usuário');

    createButton.click();
    fixture.detectChanges();

    expect(host.querySelector('.users-page__drawer--open')).not.toBeNull();
    expect(host.textContent).toContain('Criar usuário');
  });

  it('abre o drawer para editar usuario', () => {
    const host = fixture.nativeElement as HTMLElement;
    const editButton = host.querySelector<HTMLButtonElement>('button[aria-label="Editar usuário"]');

    editButton?.click();
    fixture.detectChanges();

    const emailInput = host.querySelector<HTMLInputElement>('input[formControlName="email"]');

    expect(host.querySelector('.users-page__drawer--open')).not.toBeNull();
    expect(emailInput?.disabled).toBe(true);
    expect(host.textContent).toContain('Salvar alterações');
  });

  it('abre o menu de acoes do usuario', () => {
    const host = fixture.nativeElement as HTMLElement;
    const menuButton = host.querySelector<HTMLButtonElement>('button[aria-label="Mais opções"]');

    menuButton?.click();
    fixture.detectChanges();

    expect(host.textContent).toContain('Desativar acesso');
    expect(host.textContent).toContain('Excluir usuário');
  });

  it('bloqueia alterar o acesso do proprio usuario', () => {
    const host = fixture.nativeElement as HTMLElement;
    const menuButton = host.querySelector<HTMLButtonElement>('button[aria-label="Mais opções"]');

    menuButton?.click();
    fixture.detectChanges();

    const accessButton = Array.from(host.querySelectorAll<HTMLButtonElement>('.users-page__menu-item')).find((button) =>
      button.textContent?.includes('Desativar acesso')
    );

    expect(accessButton?.disabled).toBe(true);
  });

  it('bloqueia excluir o unico administrador ativo', () => {
    const host = fixture.nativeElement as HTMLElement;
    const menuButton = host.querySelector<HTMLButtonElement>('button[aria-label="Mais opções"]');

    menuButton?.click();
    fixture.detectChanges();

    const deleteButton = Array.from(host.querySelectorAll<HTMLButtonElement>('.users-page__menu-item')).find((button) =>
      button.textContent?.includes('Excluir usuário')
    );

    expect(deleteButton?.disabled).toBe(true);
  });
});

function getButtonByText(host: HTMLElement, text: string): HTMLButtonElement {
  const button = Array.from(host.querySelectorAll('button')).find((item) => item.textContent?.includes(text));

  if (!button) {
    throw new Error(`Button not found: ${text}`);
  }

  return button;
}
