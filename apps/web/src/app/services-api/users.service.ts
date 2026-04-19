import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthUser, CreateUserInput, UpdateUserInput } from '@trinus/contracts';
import { Observable } from 'rxjs';
import { getApiBaseUrl } from './api-url';

const usersApiUrl = () => `${getApiBaseUrl()}/users`;

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);

  listUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(usersApiUrl(), { withCredentials: true });
  }

  createUser(input: CreateUserInput): Observable<AuthUser> {
    return this.http.post<AuthUser>(usersApiUrl(), input, { withCredentials: true });
  }

  updateUser(userId: string, input: UpdateUserInput): Observable<AuthUser> {
    return this.http.patch<AuthUser>(`${usersApiUrl()}/${userId}`, input, { withCredentials: true });
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${usersApiUrl()}/${userId}`, { withCredentials: true });
  }
}
