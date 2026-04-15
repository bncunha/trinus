import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import type { CreateUserInput, UpdateUserInput } from '@trinus/contracts';
import { of } from 'rxjs';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const httpMock = {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
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

  it('atualiza usuários com cookies habilitados', (done) => {
    const request: UpdateUserInput = {
      name: 'Bruno Operador',
      role: 'OPERATOR',
      isActive: false
    };
    httpMock.patch.mockReturnValue(
      of({
        id: 'user_2',
        companyId: 'company_1',
        name: request.name,
        email: 'bruno@acme.test',
        role: request.role,
        isActive: request.isActive
      })
    );
    const service = TestBed.inject(UsersService);

    service.updateUser('user_2', request).subscribe(() => {
      expect(httpMock.patch).toHaveBeenCalledWith('http://localhost:3000/users/user_2', request, {
        withCredentials: true
      });
      done();
    });
  });

  it('exclui usuários com cookies habilitados', (done) => {
    httpMock.delete.mockReturnValue(of(undefined));
    const service = TestBed.inject(UsersService);

    service.deleteUser('user_2').subscribe(() => {
      expect(httpMock.delete).toHaveBeenCalledWith('http://localhost:3000/users/user_2', {
        withCredentials: true
      });
      done();
    });
  });
});
