import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrdensServicoService, OrdemServico } from '../../services/ordens-servico';

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ordens-servico.html',
  styleUrl: './ordens-servico.css'
})
export class OrdensServicoComponent implements OnInit {
  ordens: OrdemServico[] = [];
  veiculos: any[] = [];
  itensDisponiveis: any[] = [];
  ordemSelecionada: any = null;

  erro = '';
  sucesso = '';

  novaOrdem = {
    veiculoId: ''
  };

  novoItem = {
    itemId: '',
    quantidade: 1
  };

  constructor(
    private router: Router,
    private ordensService: OrdensServicoService
  ) {}

  ngOnInit(): void {
    this.carregarOrdens();
    this.carregarVeiculos();
    this.carregarItens();
  }

  carregarOrdens() {
    this.ordensService.getOrdens().subscribe({
      next: (res) => this.ordens = res,
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar ordens de serviço';
      }
    });
  }

  carregarVeiculos() {
    this.ordensService.getVeiculos().subscribe({
      next: (res) => this.veiculos = res,
      error: (err) => console.log(err)
    });
  }

  carregarItens() {
    this.ordensService.getItensDisponiveis().subscribe({
      next: (res) => this.itensDisponiveis = res,
      error: (err) => console.log(err)
    });
  }

  criarOrdem() {
    this.erro = '';
    this.sucesso = '';

    this.ordensService.criarOrdem(this.novaOrdem).subscribe({
      next: () => {
        this.sucesso = 'Ordem de serviço criada com sucesso!';
        this.novaOrdem = { veiculoId: '' };
        this.carregarOrdens();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao criar ordem de serviço';
      }
    });
  }

  selecionarOrdem(ordem: OrdemServico) {
    this.ordensService.getOrdemById(ordem.id).subscribe({
      next: (res) => this.ordemSelecionada = res,
      error: (err) => console.log(err)
    });
  }

  adicionarItem() {
    if (!this.ordemSelecionada) return;

    this.erro = '';
    this.sucesso = '';

    this.ordensService.addItem(this.ordemSelecionada.id, this.novoItem).subscribe({
      next: () => {
        this.sucesso = 'Item adicionado!';
        this.novoItem = { itemId: '', quantidade: 1 };
        this.selecionarOrdem(this.ordemSelecionada);
        this.carregarOrdens();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao adicionar item';
      }
    });
  }

  atualizarStatus(ordem: OrdemServico, novoStatus: string) {
    this.erro = '';
    this.sucesso = '';

    this.ordensService.atualizarStatus(ordem.id, novoStatus).subscribe({
      next: () => {
        this.sucesso = 'Status atualizado com sucesso!';
        this.carregarOrdens();

        if (this.ordemSelecionada && this.ordemSelecionada.id === ordem.id) {
          this.selecionarOrdem(ordem);
        }
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao atualizar status';
      }
    });
  }

  nomeVeiculo(veiculoId: string): string {
    const veiculo = this.veiculos.find(v => v.id === veiculoId);
    if (!veiculo) return 'Veículo não encontrado';

    return `${veiculo.placa} - ${veiculo.marca} ${veiculo.modelo}`;
  }

  proximoStatus(statusAtual: string): string | null {
    const fluxo: Record<string, string> = {
      'Recebida': 'Em Diagnóstico',
      'Em Diagnóstico': 'Aguardando Aprovação',
      'Aguardando Aprovação': 'Em Execução',
      'Em Execução': 'Finalizada',
      'Finalizada': 'Entregue'
    };

    return fluxo[statusAtual] || null;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}