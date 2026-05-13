import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';

import { AdminDashboardPage } from './pages/admin/admin-dashboard/admin-dashboard';
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

  { path: 'movies', component: MoviesManagement },
  { path: 'movies/:id', component: MovieDetails },
  {path:"movies/:id/:time", component: SeatsManagement},
  { path: 'admin', component: AdminDashboardPage, canActivate: [roleGuard('admin')] },

  // seat selection route can be added here when the feature is connected to navigation

  { path: 'menu', component: MenuManagementPage },
  { path: 'bookings', component: BookingsManagementPage },
  { path: 'users', component: UsersManagementPage },
  { path: '**', redirectTo: '' },
];

