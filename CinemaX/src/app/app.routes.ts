import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth';

export const routes: Routes = [
    { path: '', component: AuthComponent },
    { path: '**', redirectTo: '' }
];
