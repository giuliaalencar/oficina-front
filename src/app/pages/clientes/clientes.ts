import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService, Cliente } from '../../services/clientes';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-clientes',
  standalone: true,
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  erro = '';
  sucesso = '';
  errosCampos: Record<string, string> = {};
  editando: Cliente | null = null;

  novoCliente = {
    nome: '',
    email: '',
    telefone: '',
    cpfCnpj: ''
  };

  constructor(
  private router: Router,
  private clientesService: ClientesService,
  private cdr: ChangeDetectorRef
) {}


  ngOnInit(): void {
    this.carregarClientes();
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
    this.errosCampos['cpfCnpj'] = 'CPF/CNPJ inválido.';
  }

  return Object.keys(this.errosCampos).length === 0;
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
      }
    });
  }

  criarCliente() {
    this.erro = '';
    this.sucesso = '';

    if (!this.validarFormulario()) {
  return;
}

    this.clientesService.criarCliente(this.novoCliente).subscribe({
      next: () => {
        this.sucesso = 'Cliente cadastrado com sucesso!';
        this.novoCliente = {
          nome: '',
          email: '',
          telefone: '',
          cpfCnpj: ''
        };
        this.carregarClientes();
      },
      error: (err) => {
  console.log('ERRO AO CRIAR:', err);

  if (typeof err?.error === 'string' && err.error.includes('ERR_001')) {
    this.errosCampos['cpfCnpj'] = 'CPF/CNPJ inválido.';
    return;
  }

  this.erro = err?.error || 'Erro ao criar cliente';
}

    });
  }

  editarCliente(cliente: Cliente) {
    this.sucesso = '';
    this.erro = '';
    this.editando = { ...cliente };

    this.novoCliente = {
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cpfCnpj: cliente.cpfCnpj
    };
  }

  salvarEdicao() {
    if (!this.editando) return;

    this.erro = '';
    this.sucesso = '';
    if (!this.validarFormulario()) {
    return;
  }


    const clienteAtualizado = {
      ...this.editando,
      ...this.novoCliente
    };

    this.clientesService.atualizarCliente(clienteAtualizado).subscribe({
      next: () => {
        this.sucesso = 'Cliente atualizado com sucesso!';
        this.editando = null;
        this.novoCliente = {
          nome: '',
          email: '',
          telefone: '',
          cpfCnpj: ''
        };
        this.carregarClientes();
      },
      error: (err) => {
  console.log('ERRO AO ATUALIZAR:', err);

  if (typeof err?.error === 'string' && err.error.includes('ERR_001')) {
    this.errosCampos['cpfCnpj'] = 'CPF/CNPJ inválido.';
    return;
  }

  this.erro = err?.error || 'Erro ao atualizar cliente';
}

    });
  }

  cancelarEdicao() {
    this.editando = null;
    this.erro = '';
    this.sucesso = '';
    this.novoCliente = {
      nome: '',
      email: '',
      telefone: '',
      cpfCnpj: ''
    };
  }

  deletarCliente(id: string) {
    this.erro = '';
    this.sucesso = '';

    this.clientesService.deletarCliente(id).subscribe({
      next: () => {
        this.sucesso = 'Cliente excluído com sucesso!';
        this.carregarClientes();
      },
      error: (err) => {
        console.log('ERRO AO DELETAR:', err);
        this.erro = 'Erro ao deletar cliente';
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}