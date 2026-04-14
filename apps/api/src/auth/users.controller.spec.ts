import { InMemoryAccountsRepository } from './accounts.repository';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let accountsRepository: InMemoryAccountsRepository;
  let authService: AuthService;
  let controller: UsersController;

  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    authService = new AuthService(accountsRepository, new PasswordService());
    controller = new UsersController(accountsRepository, authService);
  });

  it('lists only users from the authenticated company', async () => {
    const firstSession = await authService.register({
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    });
    await authService.register({
      companyName: 'Beta',
      name: 'Bia Admin',
      email: 'bia@beta.test',
      password: 'secret123'
    });

    const users = await controller.getUsers({ auth: firstSession });

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      companyId: firstSession.company.id,
      email: 'ana@acme.test'
    });
  });

  it('creates users in the authenticated company', async () => {
    const session = await authService.register({
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    const user = await controller.createUser(
      { auth: session },
      {
        name: 'Bruno Gestor',
        email: 'bruno@acme.test',
        role: 'MANAGER',
        password: 'secret123'
      }
    );

    expect(user).toMatchObject({
      companyId: session.company.id,
      name: 'Bruno Gestor',
      role: 'MANAGER',
      isActive: true
    });
  });
});
