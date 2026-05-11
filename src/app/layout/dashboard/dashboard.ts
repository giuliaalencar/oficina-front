import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
/* v8 ignore start -- Angular decorator metadata */
export class DashboardComponent {
/* v8 ignore stop */
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isFuncionario(): boolean {
    return this.auth.isFuncionario();
  }

  isCliente(): boolean {
    return this.auth.isCliente();
  }

  podeGerenciarSistema(): boolean {
    return this.auth.podeGerenciarSistema();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}



