import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';

type DecodedPayload = {
  sub: string;
  companyId: string;
  exp: number;
  typ: string;
};

function decodePayload(token: string): DecodedPayload {
  const [, payload] = token.split('.');

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as DecodedPayload;
}

describe('TokenService', () => {
  let dateSpy: jest.SpyInstance<number, []>;
  let service: TokenService;

  beforeEach(() => {
    dateSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    service = new TokenService();
  });

  afterEach(() => {
    dateSpy.mockRestore();
  });

  it('creates access tokens with a one-hour expiration by default', () => {
    const token = service.signAccessToken('user_1', 'company_1');
    const payload = decodePayload(token);

    expect(payload).toMatchObject({
      sub: 'user_1',
      companyId: 'company_1',
      typ: 'access',
      exp: 4_600
    });
    expect(service.verifyAccessToken(token)).toEqual(payload);
  });

  it('creates refresh tokens with a one-hour expiration by default', () => {
    const token = service.signRefreshToken('user_1', 'company_1');
    const payload = decodePayload(token);

    expect(payload).toMatchObject({
      sub: 'user_1',
      companyId: 'company_1',
      typ: 'refresh',
      exp: 4_600
    });
    expect(service.verifyRefreshToken(token)).toEqual(payload);
  });

  it('does not accept refresh tokens as access tokens', () => {
    const token = service.signRefreshToken('user_1', 'company_1');

    expect(() => service.verifyAccessToken(token)).toThrow(UnauthorizedException);
  });

  it('rejects expired tokens', () => {
    const token = service.signAccessToken('user_1', 'company_1');

    dateSpy.mockReturnValue(4_601_000);

    expect(() => service.verifyAccessToken(token)).toThrow(UnauthorizedException);
  });
});
