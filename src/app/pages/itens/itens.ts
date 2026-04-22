import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ItensService, Item } from '../../services/itens';

@Component({
  selector: 'app-itens',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './itens.html',
  styleUrl: './itens.css'
})
export class ItensComponent implements OnInit {
  itens: Item[] = [];
  erro = '';
  sucesso = '';
  editando: Item | null = null;

  novoItem = {
    descricao: '',
    valor: 0,
    estoque: 0,
    tipo: 'Peca'
  };

  constructor(
    private router: Router,
    private itensService: ItensService
  ) {}

  ngOnInit(): void {
    this.carregarItens();
  }

  carregarItens() {
    this.itensService.getItens().subscribe({
      next: (res) => this.itens = res,
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar itens';
      }
    });
  }

  criarItem() {
    this.erro = '';
    this.sucesso = '';

    this.itensService.criarItem({
      ...this.novoItem,
      valor: Number(this.novoItem.valor),
      estoque: Number(this.novoItem.estoque)
    }).subscribe({
      next: () => {
        this.sucesso = 'Item cadastrado com sucesso!';
        this.resetForm();
        this.carregarItens();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao cadastrar item';
      }
    });
  }

  editarItem(item: Item) {
    this.editando = { ...item };
    this.novoItem = {
      descricao: item.descricao,
      valor: item.valor,
      estoque: item.estoque,
      tipo: item.tipo
    };
  }

  salvarEdicao() {
    if (!this.editando) return;

    const itemAtualizado: Item = {
      ...this.editando,
      ...this.novoItem,
      valor: Number(this.novoItem.valor),
      estoque: Number(this.novoItem.estoque)
    };

    this.itensService.atualizarItem(itemAtualizado).subscribe({
      next: () => {
        this.sucesso = 'Item atualizado com sucesso!';
        this.editando = null;
        this.resetForm();
        this.carregarItens();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao atualizar item';
      }
    });
  }

  cancelarEdicao() {
    this.editando = null;
    this.resetForm();
  }

  deletarItem(id: number) {
    this.itensService.deletarItem(id).subscribe({
      next: () => {
        this.sucesso = 'Item excluído com sucesso!';
        this.carregarItens();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao excluir item';
      }
    });
  }

  resetForm() {
    this.novoItem = {
      descricao: '',
      valor: 0,
      estoque: 0,
      tipo: 'Peca'
    };
    this.erro = '';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}