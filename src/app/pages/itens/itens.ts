import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  errosCampos: Record<string, string> = {};

  modoFormulario = false;
  editando: Item | null = null;

  novoItem = {
    descricao: '',
    valor: 0,
    estoque: 0,
    tipo: 'Peca'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private itensService: ItensService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.modoFormulario = this.router.url.startsWith('/itens/cadastro');

    if (this.modoFormulario) {
      this.route.queryParamMap.subscribe(params => {
        const itemId = params.get('itemId');

        if (itemId) {
          this.carregarItemParaEdicao(itemId);
        }
      });
    } else {
      this.carregarItens();
    }
  }

  carregarItens() {
    this.itensService.getItens().subscribe({
      next: (res) => {
        this.itens = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar itens';
        this.cdr.detectChanges();
      }
    });
  }

  carregarItemParaEdicao(id: string) {
    this.itensService.getItemById(id).subscribe({
      next: (item) => {
        this.editando = item;
        this.novoItem = {
          descricao: item.descricao,
          valor: item.valor,
          estoque: item.estoque,
          tipo: item.tipo
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Item não encontrado.';
        this.cdr.detectChanges();
      }
    });
  }

  validarFormulario(): boolean {
    this.errosCampos = {};

    if (!this.novoItem.descricao.trim()) {
      this.errosCampos['descricao'] = 'Informe a descrição do item.';
    }

    if (Number(this.novoItem.valor) <= 0) {
      this.errosCampos['valor'] = 'Informe um valor maior que zero.';
    }

    if (Number(this.novoItem.estoque) < 0) {
      this.errosCampos['estoque'] = 'O estoque não pode ser negativo.';
    }

    if (!this.novoItem.tipo) {
      this.errosCampos['tipo'] = 'Selecione o tipo do item.';
    }

    return Object.keys(this.errosCampos).length === 0;
  }

  salvarItem() {
    this.erro = '';
    this.sucesso = '';

    if (!this.validarFormulario()) {
      return;
    }

    if (this.editando) {
      this.salvarEdicao();
    } else {
      this.criarItem();
    }
  }

  criarItem() {
    this.itensService.criarItem({
      ...this.novoItem,
      valor: Number(this.novoItem.valor),
      estoque: Number(this.novoItem.estoque)
    }).subscribe({
      next: () => {
        this.sucesso = 'Item cadastrado com sucesso!';
        this.router.navigate(['/itens']);
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao cadastrar item';
      }
    });
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
        this.router.navigate(['/itens']);
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao atualizar item';
      }
    });
  }

  irParaCadastro() {
    this.router.navigate(['/itens/cadastro']);
  }

  irParaEdicao(item: Item) {
    this.router.navigate(['/itens/cadastro'], {
      queryParams: { itemId: item.id }
    });
  }

  deletarItem(id: number) {
    this.erro = '';
    this.sucesso = '';

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

  voltar() {
    this.router.navigate(['/itens']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
