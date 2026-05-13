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

export interface ResumoOrdens {
  totalOrdens: number;
  ordensFinalizadas: number;
  tempoMedioHoras: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdensServicoService {
  private apiBase = 'https://oficina-api-10.onrender.com/api';

  private ordensUrl = `${this.apiBase}/ordens-servico`;
  private veiculosUrl = `${this.apiBase}/veiculos`;
  private itensUrl = `${this.apiBase}/itens`;

  constructor(private http: HttpClient) {}

  getResumo() {
  return this.http.get<ResumoOrdens>(`${this.ordensUrl}/resumo`);
}

  getOrdens(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.ordensUrl);
  }

  getOrdemById(id: number): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.ordensUrl}/${id}`);
  }

  criarOrdem(payload: { veiculoId: string }): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.ordensUrl, payload);
  }

  getVeiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.veiculosUrl);
  }

  getItensDisponiveis(): Observable<any[]> {
    return this.http.get<any[]>(this.itensUrl);
  }

  addItem(ordemId: number, payload: { itemId: string; quantidade: number }) {
    return this.http.post(`${this.ordensUrl}/${ordemId}/itens`, {
      itemId: Number(payload.itemId),
      quantidade: Number(payload.quantidade)
    });
  }

  atualizarStatus(ordemId: number, status: string) {
    return this.http.put(`${this.ordensUrl}/${ordemId}/status`, {
      status
    });
  }

  baixarOrcamentoPdf(ordemId: number): Observable<Blob> {
    return this.http.get(`${this.ordensUrl}/${ordemId}/orcamento-pdf`, {
      responseType: 'blob'
    });
  }
}
