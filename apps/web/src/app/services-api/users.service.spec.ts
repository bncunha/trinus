import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { CreateUserInput } from '@trinus/contracts';
import { of } from 'rxjs';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const httpMock = {
    get: jest.fn(),
    post: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [UsersService, { provide: HttpClient, useValue: httpMock }]
    });
  });

  it('lista usuários com cookies habilitados', (done) => {
    httpMock.get.mockReturnValue(of([]));
    const service = TestBed.inject(UsersService);

    service.listUsers().subscribe(() => {
      expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/users', { withCredentials: true });
      done();
    });
  });

  it('cria usuários com cookies habilitados', (done) => {
    const request: CreateUserInput = {
      name: 'Bruno Gestor',
      email: 'bruno@acme.test',
      role: 'MANAGER',
      password: 'secret123',
      isActive: true
    };
    httpMock.post.mockReturnValue(
      of({
        id: 'user_2',
        companyId: 'company_1',
        name: request.name,
        email: request.email,
        role: request.role,
        isActive: true
      })
    );
    const service = TestBed.inject(UsersService);

    service.createUser(request).subscribe(() => {
      expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/users', request, { withCredentials: true });
      done();
    });
  });
});
