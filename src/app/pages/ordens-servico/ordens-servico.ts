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
export class OrdensServicoComponent  {

  private apiUrl = 'https://oficina-api-9.onrender.com/api/ordens-servico';
  private veiculosUrl = 'https://oficina-api-9.onrender.com/api/veiculos';
  private itensUrl = 'https://oficina-api-9.onrender.com/api/itens';

  constructor(private http: HttpClient) {}

  // 🔹 Buscar ordens
  getOrdens(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  // 🔹 Criar ordem
  criarOrdem(payload: { veiculoId: string }) {
    return this.http.post<OrdemServico>(this.apiUrl, payload);
  }

  // 🔹 Buscar veículos
  getVeiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.veiculosUrl);
  }

  // 🔹 Buscar itens disponíveis
  getItensDisponiveis(): Observable<any[]> {
    return this.http.get<any[]>(this.itensUrl);
  }

  // 🔹 Buscar ordem por ID
  getOrdemById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Adicionar item na ordem
  addItem(ordemId: number, itemId: number, quantidade: number) {
    return this.http.post(`${this.apiUrl}/${ordemId}/itens`, {
      itemId,
      quantidade
    });
  }

  // 🔹 Atualizar status (avançar ordem)
  atualizarStatus(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/status`, {});
  }
}