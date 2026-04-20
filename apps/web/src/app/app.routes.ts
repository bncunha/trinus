import type { Routes } from '@angular/router';
import { authChildGuard, authGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login-page/login-page.component').then((module) => module.LoginPageComponent)
  },
  {
    path: 'criar-conta',
    loadComponent: () => import('./pages/auth/register-page/register-page.component').then((module) => module.RegisterPageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./pages/app-shell/app-shell/app-shell.component').then((module) => module.AppShellComponent),
    children: [
      {
        path: 'dashboard',
        data: { eyebrow: 'Visão geral', title: 'Dashboard' },
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page/dashboard-page.component').then((module) => module.DashboardPageComponent)
      },
      {
        path: 'minha-execucao',
        data: { eyebrow: 'Minha execução', title: 'Minha execução' },
        loadComponent: () =>
          import('./pages/operator-work/operator-work-page/operator-work-page.component').then((module) => module.OperatorWorkPageComponent)
      },
      {
        path: 'usuarios',
        data: { eyebrow: 'Usuários', title: 'Usuários' },
        loadComponent: () => import('./pages/users/users-page/users-page.component').then((module) => module.UsersPageComponent)
      },
      {
        path: 'configuracoes',
        data: { eyebrow: 'Configurações', title: 'Cadastros base' },
        loadComponent: () => import('./pages/settings/settings-page/settings-page.component').then((module) => module.SettingsPageComponent)
      },
      {
        path: 'configuracoes/unidades-medida',
        data: { eyebrow: 'Configurações', title: 'Unidades de medida' },
        loadComponent: () => import('./pages/settings/measurement-units-page/measurement-units-page.component').then((module) => module.MeasurementUnitsPageComponent)
      },
      {
        path: 'configuracoes/variaveis',
        data: { eyebrow: 'Configurações', title: 'Variáveis' },
        loadComponent: () => import('./pages/settings/variables-page/variables-page.component').then((module) => module.VariablesPageComponent)
      },
      {
        path: 'configuracoes/tamanhos',
        data: { eyebrow: 'Configuracoes', title: 'Tamanhos' },
        loadComponent: () => import('./pages/settings/sizes-page/sizes-page.component').then((module) => module.SizesPageComponent)
      },
      {
        path: 'configuracoes/setores',
        data: { eyebrow: 'Configurações', title: 'Setores' },
        loadComponent: () => import('./pages/settings/sectors-page/sectors-page.component').then((module) => module.SectorsPageComponent)
      },
      {
        path: 'configuracoes/etapas',
        data: { eyebrow: 'Configurações', title: 'Etapas' },
        loadComponent: () => import('./pages/settings/stages-page/stages-page.component').then((module) => module.StagesPageComponent)
      },
      {
        path: 'configuracoes/templates-producao',
        data: { eyebrow: 'Configurações', title: 'Templates de produção' },
        loadComponent: () => import('./pages/settings/templates-page/templates-page.component').then((module) => module.TemplatesPageComponent)
      },
      {
        path: 'clientes',
        data: { eyebrow: 'Cadastros', title: 'Clientes' },
        loadComponent: () => import('./pages/settings/customers-page/customers-page.component').then((module) => module.CustomersPageComponent)
      },
      {
        path: 'produtos',
        data: { eyebrow: 'Cadastros', title: 'Produtos' },
        loadComponent: () => import('./pages/settings/products-page/products-page.component').then((module) => module.ProductsPageComponent)
      },
      {
        path: 'pedidos',
        children: [
          {
            path: '',
            data: { eyebrow: 'Pedidos', title: 'Pedidos' },
            loadComponent: () =>
              import('./pages/orders/orders-list-page/orders-list-page.component').then((module) => module.OrdersListPageComponent)
          },
          {
            path: 'dashboard',
            data: { eyebrow: 'Resumo dos pedidos', title: 'Dashboard de pedidos' },
            loadComponent: () =>
              import('./pages/orders/orders-dashboard-page/orders-dashboard-page.component').then((module) => module.OrdersDashboardPageComponent)
          },
          {
            path: 'formulario',
            data: { eyebrow: 'Cadastro', title: 'Novo pedido' },
            loadComponent: () =>
              import('./pages/orders/order-form-page/order-form-page.component').then((module) => module.OrderFormPageComponent)
          },
          {
            path: 'formulario/:id',
            data: { eyebrow: 'Edição', title: 'Editar pedido' },
            loadComponent: () =>
              import('./pages/orders/order-form-page/order-form-page.component').then((module) => module.OrderFormPageComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
