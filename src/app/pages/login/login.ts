import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  entrar() {
    this.erro = '';

    if (!this.email.trim()) {
      this.erro = 'Digite seu email.';
      return;
    }

    if (!this.senha.trim()) {
      this.erro = 'Digite sua senha.';
      return;
    }

    this.carregando = true;

    this.auth.login({
      email: this.email.trim(),
      senha: this.senha
    }).subscribe({
      next: (res) => {
        this.carregando = false;

        if (!res?.token) {
          this.erro = 'Login realizado, mas o token não foi retornado.';
          return;
        }

        this.auth.salvarToken(res.token);

        if (this.auth.isCliente()) {
          this.router.navigate(['/ordens-servico']);
          return;
        }

        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.carregando = false;

        console.log('ERRO LOGIN:', err);

        if (err.status === 0) {
          this.erro = 'Não foi possível conectar com a API. Aguarde alguns segundos e tente novamente.';
          return;
        }

        if (err.status === 401) {
          this.erro = 'Email ou senha inválidos.';
          return;
        }

        this.erro = err?.error || 'Erro ao fazer login.';
      }
    });
  }
}
