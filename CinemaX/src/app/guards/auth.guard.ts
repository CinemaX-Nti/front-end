import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = authService.isAuthenticated();
  console.log('Auth guard check:', isAuth, 'Token:', authService.getToken());

  if (isAuth) {
    return true;
  }

  sessionStorage.setItem('authRedirectUrl', state.url);
  console.log('Redirecting to sign-in');
  router.navigate(['/sign-in']);
  return false;
};
