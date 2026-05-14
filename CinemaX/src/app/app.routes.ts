import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';

import { AdminDashboardPage } from './pages/admin/admin-dashboard/admin-dashboard';
import { AdminMoviesManagementPage } from './pages/admin/admin-movies-management/admin-movies-management';
import { AdminHallsManagementPage } from './pages/admin/admin-halls-management/admin-halls-management';
import { AdminShowtimesManagementPage } from './pages/admin/admin-showtimes-management/admin-showtimes-management';
import { MenuManagementPage } from './pages/admin/menu-management/menu-management';
import { BookingsManagementPage } from './pages/admin/bookings-management/bookings-management';
import { UsersManagementPage } from './pages/admin/users-management/users-management';
import { LandingPage } from './pages/landing-page/landing-page';
import { MoviesManagement } from './pages/movies-management/movies-management';
import { MovieDetails } from './pages/movie-details/movie-details';
import { MovieShowtimesPage } from './pages/movie-showtimes/movie-showtimes';
import { SeatsManagement } from './pages/seats-management/seats-management';
import { SnacksPage } from './pages/snacks-page/snacks-page';
import { CheckoutPage } from './pages/checkout-page/checkout-page';
import { ProfilePage } from './pages/profile/profile';
import { roleGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
  { path: 'sign-in', component: AuthComponent },
  { path: 'sign-up', component: AuthComponent },
  { path: 'confirm-email', component: AuthComponent },

  { path: 'movies', component: MoviesManagement },
  { path: 'movies/:id', component: MovieDetails },
  { path: 'movies/:id/showtimes', component: MovieShowtimesPage },
  { path: 'movies/:id/showtimes/:showtimeId/seats', component: SeatsManagement, canActivate: [authGuard] },
  { path: 'movies/:id/showtimes/:showtimeId/snacks', component: SnacksPage, canActivate: [authGuard] },
  { path: 'movies/:id/showtimes/:showtimeId/checkout', component: CheckoutPage, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardPage, canActivate: [roleGuard('admin')] },
  { path: 'admin/movies', component: AdminMoviesManagementPage, canActivate: [roleGuard('admin')] },
  { path: 'admin/halls', component: AdminHallsManagementPage, canActivate: [roleGuard('admin')] },
  { path: 'admin/showtimes', component: AdminShowtimesManagementPage, canActivate: [roleGuard('admin')] },
  { path: 'admin/menu', component: MenuManagementPage, canActivate: [roleGuard('admin')] },
  { path: 'admin/bookings', component: BookingsManagementPage, canActivate: [roleGuard('admin')] },
  { path: 'admin/users', component: UsersManagementPage, canActivate: [roleGuard('admin')] },

  { path: 'halls', redirectTo: 'admin/halls', pathMatch: 'full' },
  { path: 'showtimes', redirectTo: 'admin/showtimes', pathMatch: 'full' },
  { path: 'menu', redirectTo: 'admin/menu', pathMatch: 'full' },
  { path: 'bookings', redirectTo: 'admin/bookings', pathMatch: 'full' },
  { path: 'users', redirectTo: 'admin/users', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
