import type { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login-page.component').then((module) => module.LoginPageComponent)
  },
  {
    path: 'criar-conta',
    loadComponent: () => import('./pages/auth/register-page.component').then((module) => module.RegisterPageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./pages/app-shell/app-shell.component').then((module) => module.AppShellComponent),
    children: [
      {
        path: 'dashboard',
        data: { eyebrow: 'Visão geral', title: 'Dashboard' },
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page.component').then((module) => module.DashboardPageComponent)
      },
      {
        path: 'minha-execucao',
        data: { eyebrow: 'Minha execução', title: 'Minha execução' },
        loadComponent: () =>
          import('./pages/operator-work/operator-work-page.component').then((module) => module.OperatorWorkPageComponent)
      },
      {
        path: 'usuarios',
        data: { eyebrow: 'Usuários', title: 'Usuários' },
        loadComponent: () => import('./pages/users/users-page.component').then((module) => module.UsersPageComponent)
      },
      {
        path: 'pedidos',
        children: [
          {
            path: '',
            data: { eyebrow: 'Pedidos', title: 'Pedidos' },
            loadComponent: () =>
              import('./pages/orders/orders-list-page.component').then((module) => module.OrdersListPageComponent)
          },
          {
            path: 'dashboard',
            data: { eyebrow: 'Resumo dos pedidos', title: 'Dashboard de pedidos' },
            loadComponent: () =>
              import('./pages/orders/orders-dashboard-page.component').then((module) => module.OrdersDashboardPageComponent)
          },
          {
            path: 'formulario',
            data: { eyebrow: 'Cadastro', title: 'Novo pedido' },
            loadComponent: () =>
              import('./pages/orders/order-form-page.component').then((module) => module.OrderFormPageComponent)
          },
          {
            path: 'formulario/:id',
            data: { eyebrow: 'Edição', title: 'Editar pedido' },
            loadComponent: () =>
              import('./pages/orders/order-form-page.component').then((module) => module.OrderFormPageComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
