import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

export interface CriarUsuario {
  nome: string;
  email: string;
  senha: string;
  perfil: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'https://oficina-api-10.onrender.com/api/auth/usuarios';

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  criarUsuario(usuario: CriarUsuario): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario);
  }
}
