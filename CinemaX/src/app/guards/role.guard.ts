import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export function roleGuard(expectedRole: UserRole): CanActivateFn {
  return (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const currentRole = authService.role();

    if (currentRole === expectedRole) {
      return true;
    }

    return router.createUrlTree([currentRole === 'admin' ? '/admin' : '/user']);
  };
}
