import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services-api/auth.service';

const checkAuthenticatedRoute = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentSession) {
    return true;
  }

  return authService.checkSession().pipe(
    map((result) => {
      if (result.status === 'authenticated') {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: result.status === 'unavailable' ? { sessionError: '1' } : undefined
      });
    })
  );
};

export const authGuard: CanActivateFn = () => checkAuthenticatedRoute();
export const authChildGuard: CanActivateChildFn = () => checkAuthenticatedRoute();
