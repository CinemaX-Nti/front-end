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
import { SeatsManagement } from './pages/seats-management/seats-management';
import { roleGuard } from './guards/role.guard';

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
  {path:"movies/:id/:time", component: SeatsManagement},
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

  // seat selection route can be added here when the feature is connected to navigation

  { path: '**', redirectTo: '' },
];

