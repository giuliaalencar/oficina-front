import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VeiculosService, Veiculo } from '../../services/veiculos';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './veiculos.html',
  styleUrls: ['./veiculos.css']
})
export class VeiculosComponent implements OnInit {
  veiculos: Veiculo[] = [];
  clientes: any[] = [];
  erro = '';
  sucesso = '';
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
  private veiculosService: VeiculosService,
  private cdr: ChangeDetectorRef
) {}


  ngOnInit(): void {
    this.carregarVeiculos();
    this.carregarClientes();
  }

  carregarVeiculos() {
  this.veiculosService.getVeiculos().subscribe({
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


  criarVeiculo() {
    this.erro = '';
    this.sucesso = '';

    this.veiculosService.criarVeiculo({
      ...this.novoVeiculo,
      ano: Number(this.novoVeiculo.ano)
    }).subscribe({
      next: () => {
        this.sucesso = 'Veículo cadastrado com sucesso!';
        this.resetForm();
        this.carregarVeiculos();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao cadastrar veículo';
      }
    });
  }

  editarVeiculo(veiculo: Veiculo) {
    this.editando = { ...veiculo };
    this.novoVeiculo = {
      clienteId: veiculo.clienteId,
      placa: veiculo.placa,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano
    };
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
        this.sucesso = 'Veículo atualizado com sucesso!';
        this.editando = null;
        this.resetForm();
        this.carregarVeiculos();
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao atualizar veículo';
      }
    });
  }

  cancelarEdicao() {
    this.editando = null;
    this.resetForm();
  }

  deletarVeiculo(id: string) {
    this.erro = '';
    this.sucesso = '';

    this.veiculosService.deletarVeiculo(id).subscribe({
      next: () => {
        this.sucesso = 'Veículo excluído com sucesso!';
        this.carregarVeiculos();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao excluir veículo';
      }
    });
  }

  resetForm() {
    this.novoVeiculo = {
      clienteId: '',
      placa: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear()
    };
    this.erro = '';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  nomeCliente(clienteId: string): string {
    const cliente = this.clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  }
}
