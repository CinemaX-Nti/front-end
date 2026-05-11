import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(expectedRole: string): CanActivateFn {
  return (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const currentRole = authService.currentUserValue?.role;

    if (currentRole === expectedRole) {
      return true;
    }

    return router.createUrlTree([currentRole === 'admin' ? '/admin' : '/movies']);
  };
}
