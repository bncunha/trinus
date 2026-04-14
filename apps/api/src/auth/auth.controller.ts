import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { AuthSession, LoginInput, RegisterAccountInput } from '@trinus/contracts';
import { AuthService } from './auth.service';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_SAME_SITE,
  AUTH_COOKIE_SECURE,
  AUTH_REFRESH_COOKIE_NAME,
  AUTH_REFRESH_TOKEN_TTL_SECONDS,
  AUTH_TOKEN_TTL_SECONDS
} from './auth.constants';
import { AuthGuard } from './auth.guard';
import { TokenService } from './token.service';
import type { RequestWithAuth } from './auth.types';

type CookieResponse = {
  cookie(name: string, value: string, options: Record<string, unknown>): void;
  clearCookie(name: string, options: Record<string, unknown>): void;
};

type RefreshRequest = {
  cookies?: Record<string, string | undefined>;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService
  ) {}

  @Post('register')
  async register(@Body() body: RegisterAccountInput, @Res({ passthrough: true }) response: CookieResponse): Promise<AuthSession> {
    const session = await this.authService.register(body);
    this.setSessionCookie(response, session);

    return session;
  }

  @Post('login')
  async login(@Body() body: LoginInput, @Res({ passthrough: true }) response: CookieResponse): Promise<AuthSession> {
    const session = await this.authService.login(body);
    this.setSessionCookie(response, session);

    return session;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: CookieResponse): { ok: true } {
    this.clearSessionCookies(response);

    return { ok: true };
  }

  @Post('refresh')
  async refresh(@Req() request: RefreshRequest, @Res({ passthrough: true }) response: CookieResponse): Promise<AuthSession> {
    const refreshToken = request.cookies?.[AUTH_REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      this.clearSessionCookies(response);
      throw new UnauthorizedException('Authentication required.');
    }

    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const session = await this.authService.getSessionByUserId(payload.sub, payload.companyId);
    this.setSessionCookies(response, session);

    return session;
  }

  @Get('session')
  @UseGuards(AuthGuard)
  getSession(@Req() request: RequestWithAuth): AuthSession {
    return request.auth;
  }

  private setSessionCookie(response: CookieResponse, session: AuthSession): void {
    this.setSessionCookies(response, session);
  }

  private setSessionCookies(response: CookieResponse, session: AuthSession): void {
    response.cookie(AUTH_COOKIE_NAME, this.tokenService.signAccessToken(session.user.id, session.user.companyId), {
      httpOnly: true,
      sameSite: AUTH_COOKIE_SAME_SITE,
      secure: AUTH_COOKIE_SECURE,
      maxAge: AUTH_TOKEN_TTL_SECONDS * 1000
    });
    response.cookie(AUTH_REFRESH_COOKIE_NAME, this.tokenService.signRefreshToken(session.user.id, session.user.companyId), {
      httpOnly: true,
      sameSite: AUTH_COOKIE_SAME_SITE,
      secure: AUTH_COOKIE_SECURE,
      maxAge: AUTH_REFRESH_TOKEN_TTL_SECONDS * 1000
    });
  }

  private clearSessionCookies(response: CookieResponse): void {
    const options = {
      httpOnly: true,
      sameSite: AUTH_COOKIE_SAME_SITE,
      secure: AUTH_COOKIE_SECURE
    };

    response.clearCookie(AUTH_COOKIE_NAME, options);
    response.clearCookie(AUTH_REFRESH_COOKIE_NAME, options);
  }
}
