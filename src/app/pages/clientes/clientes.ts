import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientesService, Cliente } from '../../services/clientes';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  imports: [CommonModule, FormsModule, RouterLink],
})
/* v8 ignore start -- Angular decorator metadata */
export class ClientesComponent implements OnInit {
/* v8 ignore stop */
  clientes: Cliente[] = [];
  erro = '';
  sucesso = '';
  errosCampos: Record<string, string> = {};

  modoFormulario = false;
  editando: Cliente | null = null;

  novoCliente = {
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientesService: ClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.modoFormulario = this.router.url.startsWith('/clientes/cadastro');

    if (this.modoFormulario) {
      this.route.queryParamMap.subscribe(params => {
        const clienteId = params.get('clienteId');

        if (clienteId) {
          this.carregarClienteParaEdicao(clienteId);
        }
      });
    } else {
      this.carregarClientes();
    }
  }

  carregarClientes() {
    this.clientesService.getClientes().subscribe({
      next: (res) => {
        this.clientes = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('ERRO CLIENTES:', err);
        this.erro = 'Erro ao carregar clientes';
        this.cdr.detectChanges();
      }
    });
  }

  carregarClienteParaEdicao(id: string) {
    this.clientesService.getClienteById(id).subscribe({
      next: (cliente) => {
        this.editando = cliente;
        this.novoCliente = {
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          cpfCnpj: cliente.cpfCnpj
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Cliente nÃ£o encontrado.';
        this.cdr.detectChanges();
      }
    });
  }

  validarFormulario(): boolean {
    this.errosCampos = {};

    const documento = this.novoCliente.cpfCnpj.replace(/\D/g, '');

    if (!this.novoCliente.nome.trim()) {
      this.errosCampos['nome'] = 'Informe o nome do cliente.';
    }

    if (!this.novoCliente.email.trim()) {
      this.errosCampos['email'] = 'Informe o email do cliente.';
    }

    if (!this.novoCliente.telefone.trim()) {
      this.errosCampos['telefone'] = 'Informe o telefone do cliente.';
    }

    if (!this.novoCliente.cpfCnpj.trim()) {
      this.errosCampos['cpfCnpj'] = 'Informe o CPF ou CNPJ.';
    } else if (documento.length !== 11 && documento.length !== 14) {
      this.errosCampos['cpfCnpj'] = 'CPF/CNPJ invÃ¡lido.';
    }

    return Object.keys(this.errosCampos).length === 0;
  }

  salvarCliente() {
    this.erro = '';
    this.sucesso = '';

    if (!this.validarFormulario()) {
      return;
    }

    if (this.editando) {
      this.salvarEdicao();
    } else {
      this.criarCliente();
    }
  }

  criarCliente() {
    this.clientesService.criarCliente(this.novoCliente).subscribe({
      next: () => {
        this.sucesso = 'Cliente cadastrado com sucesso!';
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        console.log('ERRO AO CRIAR:', err);

        if (typeof err?.error === 'string' && err.error.includes('ERR_001')) {
          this.errosCampos['cpfCnpj'] = 'CPF/CNPJ invÃ¡lido.';
          return;
        }

        this.erro = err?.error || 'Erro ao criar cliente';
      }
    });
  }

  salvarEdicao() {
    if (!this.editando) return;

    const clienteAtualizado = {
      ...this.editando,
      ...this.novoCliente
    };

    this.clientesService.atualizarCliente(clienteAtualizado).subscribe({
      next: () => {
        this.sucesso = 'Cliente atualizado com sucesso!';
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        console.log('ERRO AO ATUALIZAR:', err);

        if (typeof err?.error === 'string' && err.error.includes('ERR_001')) {
          this.errosCampos['cpfCnpj'] = 'CPF/CNPJ invÃ¡lido.';
          return;
        }

        this.erro = err?.error || 'Erro ao atualizar cliente';
      }
    });
  }

  irParaCadastro() {
    this.router.navigate(['/clientes/cadastro']);
  }

  irParaEdicao(cliente: Cliente) {
    this.router.navigate(['/clientes/cadastro'], {
      queryParams: { clienteId: cliente.id }
    });
  }

  deletarCliente(id: string) {
    this.erro = '';
    this.sucesso = '';

    this.clientesService.deletarCliente(id).subscribe({
      next: () => {
        this.sucesso = 'Cliente excluÃ­do com sucesso!';
        this.carregarClientes();
      },
      error: (err) => {
        console.log('ERRO AO DELETAR:', err);
        this.erro = 'Erro ao deletar cliente';
      }
    });
  }

  voltar() {
    this.router.navigate(['/clientes']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}



