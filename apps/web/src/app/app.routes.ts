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
        path: 'configuracoes',
        data: { eyebrow: 'Configurações', title: 'Cadastros base' },
        loadComponent: () => import('./pages/settings/settings-page.component').then((module) => module.SettingsPageComponent)
      },
      {
        path: 'configuracoes/unidades-medida',
        data: { eyebrow: 'Configurações', title: 'Unidades de medida', kind: 'measurement-units' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'configuracoes/variaveis',
        data: { eyebrow: 'Configurações', title: 'Variáveis', kind: 'variables' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'configuracoes/tamanhos',
        data: { eyebrow: 'Configuracoes', title: 'Tamanhos', kind: 'sizes' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'configuracoes/setores',
        data: { eyebrow: 'Configurações', title: 'Setores', kind: 'sectors' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'configuracoes/etapas',
        data: { eyebrow: 'Configurações', title: 'Etapas', kind: 'stages' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'configuracoes/templates-producao',
        data: { eyebrow: 'Configurações', title: 'Templates de produção', kind: 'templates' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'clientes',
        data: { eyebrow: 'Cadastros', title: 'Clientes', kind: 'customers' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
      },
      {
        path: 'produtos',
        data: { eyebrow: 'Cadastros', title: 'Produtos', kind: 'products' },
        loadComponent: () => import('./pages/settings/master-data-page.component').then((module) => module.MasterDataPageComponent)
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
