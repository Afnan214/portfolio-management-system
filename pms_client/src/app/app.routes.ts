import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
];
