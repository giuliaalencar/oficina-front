import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'clientes/cadastro',
        loadComponent: () =>
          import('./pages/clientes/clientes').then(m => m.ClientesComponent)
      },
      {
        path: 'veiculos',
        loadComponent: () =>
          import('./pages/veiculos/veiculos').then(m => m.VeiculosComponent)
      },
      {
        path: 'veiculos/cadastro',
        loadComponent: () =>
          import('./pages/veiculos/veiculos').then(m => m.VeiculosComponent)
      },
      {
        path: 'itens',
        loadComponent: () =>
          import('./pages/itens/itens').then(m => m.ItensComponent)
      },
      {
        path: 'itens/cadastro',
        loadComponent: () =>
          import('./pages/itens/itens').then(m => m.ItensComponent)
      },
      {
        path: 'ordens-servico',
        loadComponent: () =>
          import('./pages/ordens-servico/ordens-servico').then(m => m.OrdensServicoComponent)
      },
      {
        path: '',
        redirectTo: 'clientes',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
