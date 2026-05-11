import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css'
})
/* v8 ignore start -- Angular decorator metadata */
export class DashboardHomeComponent implements OnInit {
/* v8 ignore stop */

  totalClientes = 0;
  totalVeiculos = 0;
  totalItens = 0;
  totalOrdens = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados() {
    this.http.get<any[]>('https://localhost:44391/api/clientes')
      .subscribe(res => this.totalClientes = res.length);

    this.http.get<any[]>('https://localhost:44391/api/veiculos')
      .subscribe(res => this.totalVeiculos = res.length);

    this.http.get<any[]>('https://localhost:44391/api/itens')
      .subscribe(res => this.totalItens = res.length);

    this.http.get<any[]>('https://localhost:44391/api/ordens-servico')
      .subscribe(res => this.totalOrdens = res.length);
  }
}


