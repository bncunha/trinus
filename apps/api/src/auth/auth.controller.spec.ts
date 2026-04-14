import { UnauthorizedException } from '@nestjs/common';
import { InMemoryAccountsRepository } from './accounts.repository';
import { AUTH_COOKIE_NAME, AUTH_REFRESH_COOKIE_NAME } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

describe('AuthController', () => {
  let accountsRepository: InMemoryAccountsRepository;
  let authService: AuthService;
  let controller: AuthController;
  let response: {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };
  let tokenService: TokenService;

  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    tokenService = new TokenService();
    authService = new AuthService(accountsRepository, new PasswordService());
    controller = new AuthController(authService, tokenService);
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };
  });

  it('registers an account and sets auth cookies', async () => {
    const session = await controller.register(
      {
        companyName: 'Acme',
        name: 'Ana Admin',
        email: 'ana@acme.test',
        password: 'secret123'
      },
      response
    );

    expect(session.user.role).toBe('ADMIN');
    expect(response.cookie).toHaveBeenCalledWith(AUTH_COOKIE_NAME, expect.any(String), expect.objectContaining({ httpOnly: true }));
    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_REFRESH_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );
  });

  it('refreshes a session from a refresh token', async () => {
    const session = await authService.register({
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    });
    const refreshToken = tokenService.signRefreshToken(session.user.id, session.user.companyId);

    await expect(
      controller.refresh(
        {
          cookies: {
            [AUTH_REFRESH_COOKIE_NAME]: refreshToken
          }
        },
        response
      )
    ).resolves.toMatchObject(session);
  });

  it('rejects refresh without refresh token and clears cookies', async () => {
    await expect(controller.refresh({ cookies: {} }, response)).rejects.toThrow(UnauthorizedException);
    expect(response.clearCookie).toHaveBeenCalledWith(AUTH_COOKIE_NAME, expect.any(Object));
    expect(response.clearCookie).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE_NAME, expect.any(Object));
  });

  it('clears cookies on logout', () => {
    expect(controller.logout(response)).toEqual({ ok: true });
    expect(response.clearCookie).toHaveBeenCalledWith(AUTH_COOKIE_NAME, expect.any(Object));
    expect(response.clearCookie).toHaveBeenCalledWith(AUTH_REFRESH_COOKIE_NAME, expect.any(Object));
  });
});
