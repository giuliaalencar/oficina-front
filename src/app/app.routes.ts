import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ClientesComponent } from './pages/clientes/clientes';
import { VeiculosComponent } from './pages/veiculos/veiculos';
import { ItensComponent } from './pages/itens/itens';
import { OrdensServicoComponent } from './pages/ordens-servico/ordens-servico';
import { DashboardComponent } from './layout/dashboard/dashboard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'clientes', component: ClientesComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'itens', component: ItensComponent },
      { path: 'ordens-servico', component: OrdensServicoComponent },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
