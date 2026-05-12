import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';

import { MenuManagementPage } from './pages/admin/menu-management/menu-management';
import { BookingsManagementPage } from './pages/admin/bookings-management/bookings-management';
import { UsersManagementPage } from './pages/admin/users-management/users-management';
import { LandingPage } from './pages/landing-page/landing-page';
import { MoviesManagement } from './pages/movies-management/movies-management';
import { MovieDetails } from './pages/movie-details/movie-details';
import { SeatsManagement } from './pages/seats-management/seats-management';

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

  // seat selection route can be added here when the feature is connected to navigation

  { path: 'menu', component: MenuManagementPage },
  { path: 'bookings', component: BookingsManagementPage },
  { path: 'users', component: UsersManagementPage },
  { path: '**', redirectTo: '' },
];

