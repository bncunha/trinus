import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import type { AuthSession, LoginInput, RegisterAccountInput } from '@trinus/contracts';

const AUTH_API_URL = 'http://localhost:3000/auth';

export type SessionCheckResult =
  | { status: 'authenticated'; session: AuthSession }
  | { status: 'anonymous' }
  | { status: 'unavailable' };

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);

  readonly session$ = this.sessionSubject.asObservable();

  get currentSession(): AuthSession | null {
    return this.sessionSubject.value;
  }

  clearSession(): void {
    this.sessionSubject.next(null);
  }

  loadSession(): Observable<AuthSession | null> {
    return this.checkSession().pipe(
      map((result) => (result.status === 'authenticated' ? result.session : null))
    );
  }

  checkSession(): Observable<SessionCheckResult> {
    return this.http.get<AuthSession>(`${AUTH_API_URL}/session`, { withCredentials: true }).pipe(
      tap((session) => this.sessionSubject.next(session)),
      map((session): SessionCheckResult => ({ status: 'authenticated', session })),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.refreshSession().pipe(
            map((session): SessionCheckResult => ({ status: 'authenticated', session })),
            catchError((refreshError: unknown) => {
              this.clearSession();

              if (refreshError instanceof HttpErrorResponse && refreshError.status === 401) {
                return of({ status: 'anonymous' } satisfies SessionCheckResult);
              }

              return of({ status: 'unavailable' } satisfies SessionCheckResult);
            })
          );
        }

        this.clearSession();

        return of({ status: 'unavailable' } satisfies SessionCheckResult);
      })
    );
  }

  refreshSession(): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${AUTH_API_URL}/refresh`, {}, { withCredentials: true }).pipe(
      tap((session) => this.sessionSubject.next(session))
    );
  }

  login(input: LoginInput): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${AUTH_API_URL}/login`, input, { withCredentials: true }).pipe(
      tap((session) => this.sessionSubject.next(session))
    );
  }

  register(input: RegisterAccountInput): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${AUTH_API_URL}/register`, input, { withCredentials: true }).pipe(
      tap((session) => this.sessionSubject.next(session))
    );
  }

  logout(): Observable<void> {
    return this.http.post<{ ok: true }>(`${AUTH_API_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession()),
      map(() => undefined)
    );
  }
}
