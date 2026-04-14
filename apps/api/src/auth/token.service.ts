import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { AUTH_REFRESH_TOKEN_TTL_SECONDS, AUTH_TOKEN_TTL_SECONDS } from './auth.constants';

interface SessionTokenPayload {
  sub: string;
  companyId: string;
  exp: number;
  typ: 'access' | 'refresh';
}

@Injectable()
export class TokenService {
  private readonly secret = process.env.JWT_SECRET ?? 'trinus-development-secret';

  signAccessToken(userId: string, companyId: string): string {
    return this.sign(userId, companyId, 'access', AUTH_TOKEN_TTL_SECONDS);
  }

  signRefreshToken(userId: string, companyId: string): string {
    return this.sign(userId, companyId, 'refresh', AUTH_REFRESH_TOKEN_TTL_SECONDS);
  }

  verifyAccessToken(token: string): SessionTokenPayload {
    return this.verify(token, 'access');
  }

  verifyRefreshToken(token: string): SessionTokenPayload {
    return this.verify(token, 'refresh');
  }

  private sign(userId: string, companyId: string, type: SessionTokenPayload['typ'], ttlSeconds: number): string {
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const payload = this.encode({
      sub: userId,
      companyId,
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
      typ: type
    });
    const signature = this.signPart(`${header}.${payload}`);

    return `${header}.${payload}.${signature}`;
  }

  private verify(token: string, expectedType: SessionTokenPayload['typ']): SessionTokenPayload {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      throw new UnauthorizedException('Invalid session.');
    }

    const expectedSignature = this.signPart(`${header}.${payload}`);
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      throw new UnauthorizedException('Invalid session.');
    }

    const parsedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionTokenPayload;

    if (
      !parsedPayload.sub ||
      !parsedPayload.companyId ||
      parsedPayload.typ !== expectedType ||
      parsedPayload.exp < Math.floor(Date.now() / 1000)
    ) {
      throw new UnauthorizedException('Invalid session.');
    }

    return parsedPayload;
  }

  private encode(value: unknown): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private signPart(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }
}
