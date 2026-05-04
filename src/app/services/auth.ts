import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://oficina-api-10.onrender.com/api/auth';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private estaNoNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dados);
  }

  salvarToken(token: string) {
    if (!this.estaNoNavegador()) {
      return;
    }

    localStorage.setItem('token', token);
  }

  saveToken(token: string) {
    this.salvarToken(token);
  }

  getToken(): string | null {
    if (!this.estaNoNavegador()) {
      return null;
    }

    return localStorage.getItem('token');
  }

  logout() {
    if (!this.estaNoNavegador()) {
      return;
    }

    localStorage.removeItem('token');
  }

  estaLogado(): boolean {
    return !!this.getToken();
  }

  isLoggedIn(): boolean {
    return this.estaLogado();
  }

  getUsuarioLogado(): any {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }

  getPerfil(): string {
    const usuario = this.getUsuarioLogado();

    const perfil =
      usuario?.perfil ||
      usuario?.role ||
      usuario?.Perfil ||
      usuario?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      '';

    return String(perfil).toUpperCase();
  }

  isAdmin(): boolean {
    return this.getPerfil() === 'ADMIN';
  }

  isFuncionario(): boolean {
    return this.getPerfil() === 'FUNCIONARIO';
  }

  isCliente(): boolean {
    return this.getPerfil() === 'CLIENTE';
  }

  podeGerenciarSistema(): boolean {
    return this.isAdmin() || this.isFuncionario();
  }
}
