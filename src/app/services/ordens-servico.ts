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
export class OrdensService {

  private apiUrl = 'https://oficina-api-9.onrender.com/api/ordens-servico';
  private veiculosUrl = 'https://oficina-api-9.onrender.com/api/veiculos';

  constructor(private http: HttpClient) {}

  getOrdens(): Observable<OrdemServico[]> {
    return this.http.get<OrdemServico[]>(this.apiUrl);
  }

  criarOrdem(payload: { veiculoId: string }) {
    return this.http.post<OrdemServico>(this.apiUrl, payload);
  }

  getVeiculos(): Observable<any[]> {
    return this.http.get<any[]>(this.veiculosUrl);
  }
}