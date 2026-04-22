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

    this.auth.login(this.email, this.senha).subscribe({
      next: (res) => {
        console.log('LOGIN OK', res);
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        console.log('ERRO LOGIN:', err);
        this.erro = JSON.stringify(err);
      }
    });
  }
}