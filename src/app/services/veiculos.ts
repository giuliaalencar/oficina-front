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
  private apiUrl = 'https://oficina-api-9.onrender.com/api/veiculos';
private clientesUrl = 'https://oficina-api-9.onrender.com/api/clientes';

  constructor(private http: HttpClient) {}

  getVeiculos(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

  criarVeiculo(veiculo: Omit<Veiculo, 'id'>): Observable<Veiculo> {
    return this.http.post<Veiculo>(this.apiUrl, veiculo);
  }

  atualizarVeiculo(veiculo: Veiculo): Observable<Veiculo> {
    return this.http.put<Veiculo>(`${this.apiUrl}/${veiculo.id}`, veiculo);
  }

  deletarVeiculo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.clientesUrl);
  }
}