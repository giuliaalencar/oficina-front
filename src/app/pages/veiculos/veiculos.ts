import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VeiculosService, Veiculo } from '../../services/veiculos';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './veiculos.html',
  styleUrl: './veiculos.css'
})
/* v8 ignore start -- Angular decorator metadata */
export class VeiculosComponent implements OnInit {
/* v8 ignore stop */
  veiculos: Veiculo[] = [];
  clientes: any[] = [];

  erro = '';
  sucesso = '';
  errosCampos: Record<string, string> = {};

  modoFormulario = false;
  editando: Veiculo | null = null;

  novoVeiculo = {
    clienteId: '',
    placa: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear()
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private veiculosService: VeiculosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.modoFormulario = this.router.url.startsWith('/veiculos/cadastro');
    this.carregarClientes();

    if (this.modoFormulario) {
      this.route.queryParamMap.subscribe(params => {
        const veiculoId = params.get('veiculoId');

        if (veiculoId) {
          this.carregarVeiculoParaEdicao(veiculoId);
        }
      });
    } else {
      this.carregarVeiculos();
    }
  }

  carregarVeiculos() {
    this.veiculosService.getVeiculos().subscribe({
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

  carregarClientes() {
    this.veiculosService.getClientes().subscribe({
      next: (res) => {
        this.clientes = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.cdr.detectChanges();
      }
    });
  }

  carregarVeiculoParaEdicao(id: string) {
    this.veiculosService.getVeiculoById(id).subscribe({
      next: (veiculo) => {
        this.editando = veiculo;
        this.novoVeiculo = {
          clienteId: veiculo.clienteId,
          placa: veiculo.placa,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: veiculo.ano
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'VeÃ­culo nÃ£o encontrado.';
        this.cdr.detectChanges();
      }
    });
  }

  validarFormulario(): boolean {
    this.errosCampos = {};

    const placa = this.novoVeiculo.placa.trim().toUpperCase();
    const placaAntiga = /^[A-Z]{3}[0-9]{4}$/;
    const placaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    if (!this.novoVeiculo.clienteId) {
      this.errosCampos['clienteId'] = 'Selecione um cliente.';
    }

    if (!this.novoVeiculo.placa.trim()) {
      this.errosCampos['placa'] = 'Informe a placa do veÃ­culo.';
    } else if (!placaAntiga.test(placa) && !placaMercosul.test(placa)) {
      this.errosCampos['placa'] = 'Formato de placa invÃ¡lido.';
    }

    if (!this.novoVeiculo.marca.trim()) {
      this.errosCampos['marca'] = 'Informe a marca do veÃ­culo.';
    }

    if (!this.novoVeiculo.modelo.trim()) {
      this.errosCampos['modelo'] = 'Informe o modelo do veÃ­culo.';
    }

    if (!this.novoVeiculo.ano || Number(this.novoVeiculo.ano) <= 0) {
      this.errosCampos['ano'] = 'Informe um ano vÃ¡lido.';
    }

    return Object.keys(this.errosCampos).length === 0;
  }

  salvarVeiculo() {
    this.erro = '';
    this.sucesso = '';

    if (!this.validarFormulario()) {
      return;
    }

    if (this.editando) {
      this.salvarEdicao();
    } else {
      this.criarVeiculo();
    }
  }

  criarVeiculo() {
    this.veiculosService.criarVeiculo({
      ...this.novoVeiculo,
      ano: Number(this.novoVeiculo.ano)
    }).subscribe({
      next: () => {
        this.sucesso = 'VeÃ­culo cadastrado com sucesso!';
        this.router.navigate(['/veiculos']);
      },
      error: (err) => {
        console.log(err);

        if (typeof err?.error === 'string' && err.error.includes('ERR_002')) {
          this.errosCampos['placa'] = 'Formato de placa invÃ¡lido.';
          return;
        }

        this.erro = err?.error || 'Erro ao cadastrar veÃ­culo';
      }
    });
  }

  salvarEdicao() {
    if (!this.editando) return;

    const veiculoAtualizado: Veiculo = {
      ...this.editando,
      ...this.novoVeiculo,
      ano: Number(this.novoVeiculo.ano)
    };

    this.veiculosService.atualizarVeiculo(veiculoAtualizado).subscribe({
      next: () => {
        this.sucesso = 'VeÃ­culo atualizado com sucesso!';
        this.router.navigate(['/veiculos']);
      },
      error: (err) => {
        console.log(err);

        if (typeof err?.error === 'string' && err.error.includes('ERR_002')) {
          this.errosCampos['placa'] = 'Formato de placa invÃ¡lido.';
          return;
        }

        this.erro = err?.error || 'Erro ao atualizar veÃ­culo';
      }
    });
  }

  irParaCadastro() {
    this.router.navigate(['/veiculos/cadastro']);
  }

  irParaEdicao(veiculo: Veiculo) {
    this.router.navigate(['/veiculos/cadastro'], {
      queryParams: { veiculoId: veiculo.id }
    });
  }

  deletarVeiculo(id: string) {
    this.erro = '';
    this.sucesso = '';

    this.veiculosService.deletarVeiculo(id).subscribe({
      next: () => {
        this.sucesso = 'VeÃ­culo excluÃ­do com sucesso!';
        this.carregarVeiculos();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao excluir veÃ­culo';
      }
    });
  }

  voltar() {
    this.router.navigate(['/veiculos']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  nomeCliente(clienteId: string): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente nÃ£o encontrado';
  }
}



