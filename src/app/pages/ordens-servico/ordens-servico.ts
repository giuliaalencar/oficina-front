import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
/* v8 ignore start -- Angular decorator metadata */
export class OrdensServicoComponent implements OnInit {
/* v8 ignore stop */
  ordens: OrdemServico[] = [];
  veiculos: any[] = [];
  itensDisponiveis: any[] = [];
  ordemSelecionada: any = null;
  resumo: ResumoOrdens | null = null;

  modoFormulario = false;
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
    public authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.modoFormulario = this.router.url.startsWith('/ordens-servico/cadastro');

    if (this.modoFormulario) {
      this.carregarVeiculos();
      this.carregarItens();
      return;
    }

    this.carregarOrdens();

    if (this.authService.podeGerenciarSistema()) {
      this.carregarResumo();
    }
  }

  carregarResumo() {
    if (!this.authService.podeGerenciarSistema()) {
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
        this.erro = 'Erro ao carregar ordens de serviÃ§o';
        this.cdr.detectChanges();
      }
    });
  }

  carregarVeiculos() {
    if (!this.authService.podeGerenciarSistema()) {
      return;
    }

    this.ordensService.getVeiculos().subscribe({
      next: (res) => {
        this.veiculos = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar veÃ­culos';
        this.cdr.detectChanges();
      }
    });
  }

  carregarItens() {
    if (!this.authService.podeGerenciarSistema()) {
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
      this.errosCampos['veiculoId'] = 'Selecione um veÃ­culo para criar a ordem.';
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
        this.router.navigate(['/ordens-servico']);
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao criar ordem de serviÃ§o';
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
          this.erro = 'Estoque indisponÃ­vel para um ou mais itens desta ordem.';
        } else if (typeof err?.error === 'string') {
          this.erro = err.error;
        } else {
          this.erro = 'Erro ao atualizar status da ordem.';
        }
      }
    });
  }
  baixarOrcamentoPdf(ordem: OrdemServico | any) {
    if (!ordem?.id) {
      this.erro = 'Selecione uma ordem para gerar o orçamento.';
      return;
    }

    this.erro = '';
    this.sucesso = '';

    this.ordensService.baixarOrcamentoPdf(ordem.id).subscribe({
      next: (arquivo) => {
        this.salvarPdf(arquivo, `orcamento-os-${ordem.id}.pdf`);
        this.sucesso = 'Orçamento em PDF gerado com sucesso!';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao gerar PDF do orçamento.';
        this.cdr.detectChanges();
      }
    });
  }

  private salvarPdf(arquivo: Blob, nomeArquivo: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const url = window.URL.createObjectURL(arquivo);
    const link = document.createElement('a');

    link.href = url;
    link.download = nomeArquivo;
    link.click();

    window.URL.revokeObjectURL(url);
  }
  nomeVeiculo(veiculoId: string): string {
    const veiculo = this.veiculos.find(v => v.id === veiculoId);

    if (!veiculo) {
      return 'VeÃ­culo nÃ£o encontrado';
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
      'Recebida': 'Em DiagnÃ³stico',
      'Em DiagnÃ³stico': 'Aguardando AprovaÃ§Ã£o',
      'Aguardando AprovaÃ§Ã£o': 'Em ExecuÃ§Ã£o',
      'Em ExecuÃ§Ã£o': 'Finalizada',
      'Finalizada': 'Entregue'
    };

    return fluxo[statusAtual] || null;
  }

  irParaCadastro() {
    this.router.navigate(['/ordens-servico/cadastro']);
  }

  voltar() {
    this.router.navigate(['/ordens-servico']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}




