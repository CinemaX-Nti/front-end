import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';
import { LandingPage } from './pages/landing/landing-page/landing-page';
import { SignInPage } from './pages/auth/sign-in/sign-in';
import { SignUpPage } from './pages/auth/sign-up/sign-up';
import { ConfirmEmailOtpPage } from './pages/auth/confirm-email-otp/confirm-email-otp';
import { ForgotPasswordPage } from './pages/auth/forgot-password/forgot-password';
import { ResetPasswordPage } from './pages/auth/reset-password/reset-password';
import { DeleteAccountOtpPage } from './pages/auth/delete-account-otp/delete-account-otp';
import { MoviesListingPage } from './pages/customer/movies-listing/movies-listing';

import { HallsManagementPage } from './pages/admin/halls-management/halls-management';

import { MenuManagementPage } from './pages/admin/menu-management/menu-management';
import { BookingsManagementPage } from './pages/admin/bookings-management/bookings-management';
import { UsersManagementPage } from './pages/admin/users-management/users-management';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  { path: 'sign-in', component: SignInPage },
  { path: 'sign-up', component: SignUpPage },
  { path: 'confirm-email', component: ConfirmEmailOtpPage },
  { path: 'forgot-password', component: ForgotPasswordPage },
  { path: 'reset-password', component: ResetPasswordPage },
  { path: 'delete-account', component: DeleteAccountOtpPage },
  // { path: 'home', component: Home },
  { path: 'movies', component: MoviesListingPage },

  { path: 'halls', component: HallsManagementPage },

  { path: 'menu', component: MenuManagementPage },
  { path: 'bookings', component: BookingsManagementPage },
  { path: 'users', component: UsersManagementPage },
  { path: '**', redirectTo: 'landing' },
];
