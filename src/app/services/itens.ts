import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  id: number;
  descricao: string;
  valor: number;
  estoque: number;
  tipo: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItensService {
  private apiUrl = 'https://oficina-api-10.onrender.com/api/itens';

  constructor(private http: HttpClient) {}

  getItens(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }

  criarItem(item: Omit<Item, 'id'>): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  atualizarItem(item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${item.id}`, item);
  }

  deletarItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}