import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { planGuard } from './core/plan.guard';

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
        path: 'panel-control',
        loadComponent: () => import('./dashboard/panel-control.component').then(m => m.PanelControlComponent)
      },
      {
        path: 'configuraciones',
        loadComponent: () => import('./dashboard/configuraciones.component').then(m => m.ConfiguracionesComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./dashboard/roles.component').then(m => m.RolesComponent)
      },
      {
        path: 'permisos',
        loadComponent: () => import('./dashboard/permisos.component').then(m => m.PermisosComponent)
      },
      {
        path: 'roles-permisos',
        loadComponent: () => import('./dashboard/roles-permisos.component').then(m => m.RolesPermisosComponent)
      },
      {
        path: 'empleados',
        loadComponent: () => import('./dashboard/empleados.component').then(m => m.EmpleadosComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./dashboard/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'planes',
        loadComponent: () => import('./dashboard/planes.component').then(m => m.PlanesComponent)
      },
      {
        path: 'suscripcion',
        loadComponent: () => import('./dashboard/suscripcion.component').then(m => m.SuscripcionComponent)
      },
      {
        path: 'contabilidad',
        canActivate: [planGuard],
        loadComponent: () => import('./dashboard/contabilidad.component').then(m => m.ContabilidadComponent)
      },
      {
        path: 'inventario',
        canActivate: [planGuard],
        loadComponent: () => import('./dashboard/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'ventas',
        canActivate: [planGuard],
        loadComponent: () => import('./dashboard/ventas.component').then(m => m.VentasComponent)
      },
      {
        path: 'compras',
        canActivate: [planGuard],
        loadComponent: () => import('./dashboard/compras.component').then(m => m.ComprasComponent)
      },
      {
        path: 'cartera',
        canActivate: [planGuard],
        loadComponent: () => import('./dashboard/cartera.component').then(m => m.CarteraComponent)
      },
      {
        path: 'reportes',
        canActivate: [planGuard],
        loadComponent: () => import('./dashboard/reportes.component').then(m => m.ReportesComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
