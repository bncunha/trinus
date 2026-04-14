import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { InMemoryAccountsRepository } from './accounts.repository';
import { AuthGuard } from './auth.guard';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

describe('AuthGuard', () => {
  let accountsRepository: InMemoryAccountsRepository;
  let guard: AuthGuard;
  let tokenService: TokenService;

  const createContext = (request: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request
      })
    }) as ExecutionContext;

  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    tokenService = new TokenService();
    guard = new AuthGuard(accountsRepository, tokenService);
  });

  it('attaches the session for a valid access token', async () => {
    const passwordHash = await new PasswordService().hash('secret123');
    const session = await accountsRepository.createAccount(
      {
        companyName: 'Acme',
        name: 'Ana Admin',
        email: 'ana@acme.test',
        password: 'secret123'
      },
      passwordHash
    );
    const request = {
      cookies: {
        [AUTH_COOKIE_NAME]: tokenService.signAccessToken(session.user.id, session.user.companyId)
      }
    };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request).toMatchObject({ auth: session });
  });

  it('rejects missing access tokens', async () => {
    await expect(guard.canActivate(createContext({ cookies: {} }))).rejects.toThrow(UnauthorizedException);
  });

  it('rejects company mismatches between token and stored user', async () => {
    const passwordHash = await new PasswordService().hash('secret123');
    const session = await accountsRepository.createAccount(
      {
        companyName: 'Acme',
        name: 'Ana Admin',
        email: 'ana@acme.test',
        password: 'secret123'
      },
      passwordHash
    );
    const request = {
      cookies: {
        [AUTH_COOKIE_NAME]: tokenService.signAccessToken(session.user.id, 'other_company')
      }
    };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(UnauthorizedException);
  });
});
