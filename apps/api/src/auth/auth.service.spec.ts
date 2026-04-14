import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InMemoryAccountsRepository } from './accounts.repository';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';

describe('AuthService', () => {
  let accountsRepository: InMemoryAccountsRepository;
  let service: AuthService;

  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    service = new AuthService(accountsRepository, new PasswordService());
  });

  it('creates a company and first admin user', async () => {
    const session = await service.register({
      companyName: 'Acme Confeccoes',
      name: 'Ana Admin',
      email: 'ANA@ACME.TEST',
      password: 'secret123'
    });

    expect(session.company.name).toBe('Acme Confeccoes');
    expect(session.user).toMatchObject({
      companyId: session.company.id,
      name: 'Ana Admin',
      email: 'ana@acme.test',
      role: 'ADMIN',
      isActive: true
    });
  });

  it('does not allow duplicated emails across accounts', async () => {
    await service.register({
      companyName: 'Acme',
      name: 'Ana',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    await expect(
      service.register({
        companyName: 'Beta',
        name: 'Ana 2',
        email: 'ANA@ACME.TEST',
        password: 'secret123'
      })
    ).rejects.toThrow(ConflictException);
  });

  it('logs in an active user with valid credentials', async () => {
    const registered = await service.register({
      companyName: 'Acme',
      name: 'Ana',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    const session = await service.login({
      email: 'ana@acme.test',
      password: 'secret123'
    });

    expect(session.user.id).toBe(registered.user.id);
    expect(session.company.id).toBe(registered.company.id);
  });

  it('rejects invalid credentials without revealing the cause', async () => {
    await expect(
      service.login({
        email: 'missing@acme.test',
        password: 'wrong'
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  it('requires a password for active invited users', async () => {
    const registered = await service.register({
      companyName: 'Acme',
      name: 'Ana',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    await expect(
      service.createUser(registered.company.id, {
        name: 'Bruno Gestor',
        email: 'bruno@acme.test',
        role: 'MANAGER'
      })
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid roles at runtime', async () => {
    const registered = await service.register({
      companyName: 'Acme',
      name: 'Ana',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    await expect(
      service.createUser(registered.company.id, {
        name: 'Invalid User',
        email: 'invalid@acme.test',
        role: 'OWNER',
        password: 'secret123'
      } as never)
    ).rejects.toThrow(BadRequestException);
  });
});
