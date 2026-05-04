import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';

  constructor(private auth: AuthService, private router: Router) {}

  entrar() {
    console.log('EMAIL:', this.email);
    console.log('SENHA:', this.senha);

    this.auth.login({
  email: this.email,
  senha: this.senha
}).subscribe({

      next: () => {
  if (this.auth.isCliente()) {
    this.router.navigate(['/ordens-servico']);
  } else {
    this.router.navigate(['/clientes']);
  }
},

      error: (err) => {
  console.log('ERRO LOGIN:', err);

  if (err.status === 0) {
    this.erro = 'Não foi possível conectar à API. Aguarde alguns segundos e tente novamente.';
    return;
  }

  if (typeof err?.error === 'string') {
    this.erro = err.error;
    return;
  }

  this.erro = 'Email ou senha inválidos.';
}

    });
  }
}