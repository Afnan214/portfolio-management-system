import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { CreatePortfolio } from './pages/portfolio/create-portfolio/create-portfolio';
import { PortfolioDetails } from './pages/portfolio/portfolio-details/portfolio-details';
import { Portfolios } from './pages/portfolio/portfolios/portfolios';

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
  {
    path: 'create-portfolio',
    component: CreatePortfolio,
    canActivate: [authGuard],
  },
  {
    path: 'portfolios/:id',
    component: PortfolioDetails,
    canActivate: [authGuard],
  },
  {
    path: 'portfolios',
    component: Portfolios,
    canActivate: [authGuard],
  },
];
