import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrdemServico {
  id: number;
  veiculoId: string;
  dataEntrada: string;
  status: string;
  valorTotal: number;
  itens: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrdensServicoService {
  private apiUrl = 'https://localhost:44391/api/ordens-servico';
  private veiculosUrl = 'https://localhost:44391/api/veiculos';

  constructor(private http: HttpClient) {}

  getOrdens(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  criarOrdem(payload: { veiculoId: string }): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.apiUrl, payload);
  }

  atualizarStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }

  getVeiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.veiculosUrl);
  }

  addItem(ordemId: number, payload: any) {
  return this.http.post(`${this.apiUrl}/${ordemId}/itens`, payload);
}

getOrdemById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}

getItensDisponiveis() {
  return this.http.get<any[]>('https://localhost:44391/api/itens');
}
}