import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './auth/auth.guard';
import { CreatePortfolio } from './pages/portfolio/create-portfolio/create-portfolio';
import { PortfolioDetails } from './pages/portfolio/portfolio-details/portfolio-details';
import { Portfolios } from './pages/portfolio/portfolios/portfolios';
import { ConsoleContainer } from './components/console-container/console-container';

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
    path: 'console',
    component: ConsoleContainer,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
      },
      {
        path: 'portfolios',
        component: Portfolios,
        canActivate: [authGuard],
      },
      {
        path: 'portfolios/create',
        component: CreatePortfolio,
        canActivate: [authGuard],
      },
      {
        path: 'portfolios/:id',
        component: PortfolioDetails,
        canActivate: [authGuard],
      },

    ]
  }


];
