import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing-page.component').then(m => m.LandingPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register-empresa.component').then(m => m.RegisterEmpresaComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./dashboard/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'empresas',
        loadComponent: () => import('./dashboard/empresa-list.component').then(m => m.EmpresaListComponent)
      },
      {
        path: 'mi-empresa',
        loadComponent: () => import('./dashboard/mi-empresa.component').then(m => m.MiEmpresaComponent)
      },
      {
        path: 'configuraciones',
        loadComponent: () => import('./dashboard/configuraciones.component').then(m => m.ConfiguracionesComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
