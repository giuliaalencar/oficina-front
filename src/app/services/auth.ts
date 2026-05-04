import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) {}

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dados);
  }

  salvarToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  estaLogado(): boolean {
    return !!this.getToken();
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
