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

  it('updates users from the authenticated company', async () => {
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

    const updatedUser = await controller.updateUser(
      { auth: session },
      user.id,
      {
        name: 'Bruno Operador',
        role: 'OPERATOR',
        isActive: false
      }
    );

    expect(updatedUser).toMatchObject({
      id: user.id,
      name: 'Bruno Operador',
      role: 'OPERATOR',
      isActive: false
    });
  });

  it('deletes users from the authenticated company', async () => {
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

    await controller.deleteUser({ auth: session }, user.id);

    await expect(controller.getUsers({ auth: session })).resolves.toHaveLength(1);
  });

  it('does not delete the authenticated user', async () => {
    const session = await authService.register({
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    await expect(controller.deleteUser({ auth: session }, session.user.id)).rejects.toThrow(
      'Users cannot delete themselves.'
    );
  });

  it('does not deactivate the only active admin', async () => {
    const session = await authService.register({
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    });

    await expect(controller.updateUser({ auth: session }, session.user.id, { isActive: false })).rejects.toThrow(
      'At least one active administrator is required.'
    );
  });

  it('does not delete the only active admin even when the requester is another admin', async () => {
    const session = await authService.register({
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    });
    const secondAdmin = await controller.createUser(
      { auth: session },
      {
        name: 'Bruno Admin',
        email: 'bruno@acme.test',
        role: 'ADMIN',
        password: 'secret123',
        isActive: false
      }
    );

    await expect(controller.deleteUser({ auth: { ...session, user: secondAdmin } }, session.user.id)).rejects.toThrow(
      'At least one active administrator is required.'
    );
  });
});
