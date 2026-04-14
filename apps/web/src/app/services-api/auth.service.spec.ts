import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { AuthSession, LoginInput, RegisterAccountInput } from '@trinus/contracts';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const session: AuthSession = {
    user: {
      id: 'user_1',
      companyId: 'company_1',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      role: 'ADMIN',
      isActive: true
    },
    company: {
      id: 'company_1',
      name: 'Acme'
    }
  };
  const httpMock = {
    get: jest.fn(),
    post: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: HttpClient, useValue: httpMock }]
    });
  });

  it('loads an existing session using credentials', (done) => {
    httpMock.get.mockReturnValue(of(session));
    const service = TestBed.inject(AuthService);

    service.loadSession().subscribe((currentSession) => {
      expect(currentSession).toEqual(session);
      expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/auth/session', { withCredentials: true });
      done();
    });
  });

  it('returns anonymous when there is no session', (done) => {
    httpMock.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    httpMock.post.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const service = TestBed.inject(AuthService);

    service.checkSession().subscribe((result) => {
      expect(result).toEqual({ status: 'anonymous' });
      expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/auth/refresh', {}, { withCredentials: true });
      done();
    });
  });

  it('refreshes the session when the access token has expired', (done) => {
    httpMock.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    httpMock.post.mockReturnValue(of(session));
    const service = TestBed.inject(AuthService);

    service.checkSession().subscribe((result) => {
      expect(result).toEqual({ status: 'authenticated', session });
      expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/auth/refresh', {}, { withCredentials: true });
      done();
    });
  });

  it('returns unavailable when session verification has an infrastructure error', (done) => {
    httpMock.get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const service = TestBed.inject(AuthService);

    service.checkSession().subscribe((result) => {
      expect(result).toEqual({ status: 'unavailable' });
      done();
    });
  });

  it('logs in and registers through the API with cookies enabled', (done) => {
    const login: LoginInput = {
      email: 'ana@acme.test',
      password: 'secret123'
    };
    const account: RegisterAccountInput = {
      companyName: 'Acme',
      name: 'Ana Admin',
      email: 'ana@acme.test',
      password: 'secret123'
    };

    httpMock.post.mockReturnValue(of(session));
    const service = TestBed.inject(AuthService);

    service.login(login).subscribe(() => {
      service.register(account).subscribe(() => {
        expect(httpMock.post).toHaveBeenNthCalledWith(1, 'http://localhost:3000/auth/login', login, {
          withCredentials: true
        });
        expect(httpMock.post).toHaveBeenNthCalledWith(2, 'http://localhost:3000/auth/register', account, {
          withCredentials: true
        });
        done();
      });
    });
  });

});
