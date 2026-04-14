import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services-api/auth.service';

const PUBLIC_AUTH_ENDPOINTS = ['/auth/session', '/auth/login', '/auth/register', '/auth/refresh'];

export const authSessionInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.some((endpoint) => request.url.includes(endpoint));

      if (error instanceof HttpErrorResponse && error.status === 401 && !isPublicAuthRequest) {
        return authService.refreshSession().pipe(
          switchMap(() => next(request)),
          catchError((refreshError: unknown) => {
            authService.clearSession();
            void router.navigateByUrl('/login');

            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
