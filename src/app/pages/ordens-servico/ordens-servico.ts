import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrdensServicoService, OrdemServico, ResumoOrdens } from '../../services/ordens-servico';

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
  resumo: ResumoOrdens | null = null;

  abaAtiva = 'dados';

  erro = '';
  sucesso = '';
  errosCampos: Record<string, string> = {};

  novaOrdem = {
    veiculoId: ''
  };

  novoItem = {
    itemId: '',
    quantidade: 1
  };

  constructor(
    private router: Router,
    private ordensService: OrdensServicoService,
    private cdr: ChangeDetectorRef,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.carregarOrdens();

    if (this.authService.isAdmin()) {
      this.carregarResumo();
      this.carregarVeiculos();
      this.carregarItens();
    }
  }

  carregarResumo() {
    if (!this.authService.isAdmin()) {
      return;
    }

    this.ordensService.getResumo().subscribe({
      next: (res) => {
        this.resumo = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.cdr.detectChanges();
      }
    });
  }

  carregarOrdens() {
    this.ordensService.getOrdens().subscribe({
      next: (res) => {
        this.ordens = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar ordens de serviço';
        this.cdr.detectChanges();
      }
    });
  }

  carregarVeiculos() {
    if (!this.authService.isAdmin()) {
      return;
    }

    this.ordensService.getVeiculos().subscribe({
      next: (res) => {
        this.veiculos = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar veículos';
        this.cdr.detectChanges();
      }
    });
  }

  carregarItens() {
    if (!this.authService.isAdmin()) {
      return;
    }

    this.ordensService.getItensDisponiveis().subscribe({
      next: (res) => {
        this.itensDisponiveis = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar itens';
        this.cdr.detectChanges();
      }
    });
  }

  validarNovaOrdem(): boolean {
    this.errosCampos = {};

    if (!this.novaOrdem.veiculoId) {
      this.errosCampos['veiculoId'] = 'Selecione um veículo para criar a ordem.';
    }

    return Object.keys(this.errosCampos).length === 0;
  }

  validarItemOrdem(): boolean {
    this.errosCampos = {};

    if (!this.novoItem.itemId) {
      this.errosCampos['itemId'] = 'Selecione um item.';
    }

    if (!this.novoItem.quantidade || Number(this.novoItem.quantidade) <= 0) {
      this.errosCampos['quantidade'] = 'Informe uma quantidade maior que zero.';
    }

    return Object.keys(this.errosCampos).length === 0;
  }

  criarOrdem() {
    this.erro = '';
    this.sucesso = '';

    if (!this.validarNovaOrdem()) {
      return;
    }

    this.ordensService.criarOrdem(this.novaOrdem).subscribe({
      next: () => {
        this.sucesso = 'Ordem de serviço criada com sucesso!';
        this.novaOrdem = { veiculoId: '' };
        this.carregarOrdens();
        this.carregarResumo();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao criar ordem de serviço';
      }
    });
  }

  selecionarOrdem(ordem: OrdemServico) {
    this.abaAtiva = 'dados';

    this.ordensService.getOrdemById(ordem.id).subscribe({
      next: (res) => {
        this.ordemSelecionada = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao buscar detalhes da ordem';
        this.cdr.detectChanges();
      }
    });
  }

  adicionarItem() {
    if (!this.ordemSelecionada) {
      this.erro = 'Selecione uma ordem primeiro';
      return;
    }

    this.erro = '';
    this.sucesso = '';

    if (!this.validarItemOrdem()) {
      return;
    }

    this.ordensService.addItem(this.ordemSelecionada.id, this.novoItem).subscribe({
      next: () => {
        this.sucesso = 'Item adicionado!';
        this.novoItem = { itemId: '', quantidade: 1 };
        this.selecionarOrdem(this.ordemSelecionada);
        this.carregarOrdens();
        this.carregarResumo();
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
        this.carregarResumo();

        if (this.ordemSelecionada && this.ordemSelecionada.id === ordem.id) {
          this.selecionarOrdem(ordem);
        }
      },
      error: (err) => {
        console.log(err);

        if (typeof err?.error === 'string' && err.error.includes('ERR_003')) {
          this.erro = 'Estoque indisponível para um ou mais itens desta ordem.';
        } else if (typeof err?.error === 'string') {
          this.erro = err.error;
        } else {
          this.erro = 'Erro ao atualizar status da ordem.';
        }

        setTimeout(() => {
          if (typeof document !== 'undefined') {
            document.getElementById('alerta-ordens')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 0);
      }
    });
  }

  nomeVeiculo(veiculoId: string): string {
    const veiculo = this.veiculos.find(v => v.id === veiculoId);

    if (!veiculo) {
      return 'Veículo não encontrado';
    }

    return `${veiculo.placa} - ${veiculo.marca} ${veiculo.modelo}`;
  }

  nomeVeiculoDaOrdem(ordem: any): string {
    if (ordem?.veiculo) {
      return `${ordem.veiculo.placa} - ${ordem.veiculo.marca} ${ordem.veiculo.modelo}`;
    }

    return this.nomeVeiculo(ordem.veiculoId);
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

  itensPeca() {
    return this.itensDisponiveis.filter(item => item.tipo === 'Peca');
  }

  itensServico() {
    return this.itensDisponiveis.filter(item => item.tipo !== 'Peca');
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
