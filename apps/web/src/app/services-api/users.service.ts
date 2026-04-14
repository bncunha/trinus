import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthUser, CreateUserInput } from '@trinus/contracts';
import { Observable } from 'rxjs';

const USERS_API_URL = 'http://localhost:3000/users';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);

  listUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(USERS_API_URL, { withCredentials: true });
  }

  createUser(input: CreateUserInput): Observable<AuthUser> {
    return this.http.post<AuthUser>(USERS_API_URL, input, { withCredentials: true });
  }
}
