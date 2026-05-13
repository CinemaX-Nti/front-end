import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function roleGuard(expectedRole: string): CanActivateFn {
  return (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const storedUser = localStorage.getItem('user');
    const parsedStoredUser = storedUser ? JSON.parse(storedUser) as { role?: string } : null;
    const currentRole = (authService.currentUserValue?.role ?? parsedStoredUser?.role ?? '').toLowerCase();

    if (currentRole === expectedRole.toLowerCase()) {
      return true;
    }

    return router.createUrlTree([currentRole === 'admin' ? '/admin' : '/']);
  };
}
