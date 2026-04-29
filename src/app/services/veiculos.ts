import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Veiculo {
  id: string;
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
}

@Injectable({
  providedIn: 'root'
})
export class VeiculosService {
  private apiBase = 'https://oficina-api-10.onrender.com/api';

  private veiculosUrl = `${this.apiBase}/veiculos`;
  private clientesUrl = `${this.apiBase}/clientes`;

  constructor(private http: HttpClient) {}

  getVeiculos(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.veiculosUrl);
  }

  getVeiculoById(id: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.veiculosUrl}/${id}`);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.clientesUrl);
  }

  criarVeiculo(veiculo: Omit<Veiculo, 'id'>): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.veiculosUrl, veiculo);
  }

  atualizarVeiculo(veiculo: Veiculo): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.veiculosUrl}/${veiculo.id}`, veiculo);
  }

  deletarVeiculo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.veiculosUrl}/${id}`);
  }
}
