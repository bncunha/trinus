import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { AccountsRepository } from './accounts.repository';
import { TokenService } from './token.service';
import type { RequestWithAuth } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly tokenService: TokenService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Authentication required.');
    }

    const payload = this.tokenService.verifyAccessToken(token);
    const session = await this.accountsRepository.findSessionByUserId(payload.sub);

    if (!session || session.user.companyId !== payload.companyId) {
      throw new UnauthorizedException('Authentication required.');
    }

    request.auth = session;

    return true;
  }
}
