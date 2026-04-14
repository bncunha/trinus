import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const createContext = (role: string): ExecutionContext =>
    ({
      getClass: () => class TestController {},
      getHandler: () => function testHandler() {},
      switchToHttp: () => ({
        getRequest: () => ({
          auth: {
            user: { role }
          }
        })
      })
    }) as unknown as ExecutionContext;

  it('allows requests when no role metadata is defined', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined)
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext('OPERATOR'))).toBe(true);
  });

  it('allows users with an accepted role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN'])
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
  });

  it('rejects users without an accepted role', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['ADMIN'])
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext('MANAGER'))).toThrow(ForbiddenException);
  });
});
