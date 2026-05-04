import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuariosService, Usuario } from '../../services/usuarios';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  modoFormulario = false;

  erro = '';
  sucesso = '';

  novoUsuario = {
    nome: '',
    email: '',
    senha: '',
    perfil: 2
  };

  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.modoFormulario = this.router.url.startsWith('/usuarios/cadastro');

    if (!this.modoFormulario) {
      this.carregarUsuarios();
    }
  }

  carregarUsuarios() {
    this.usuariosService.listarUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.erro = 'Erro ao carregar usuários. Apenas ADMIN pode acessar esta tela.';
        this.cdr.detectChanges();
      }
    });
  }

  cadastrarUsuario() {
    this.erro = '';
    this.sucesso = '';

    if (!this.novoUsuario.nome.trim()) {
      this.erro = 'Informe o nome.';
      return;
    }

    if (!this.novoUsuario.email.trim()) {
      this.erro = 'Informe o email.';
      return;
    }

    if (!this.novoUsuario.senha.trim()) {
      this.erro = 'Informe a senha.';
      return;
    }

    if (![1, 2, 3].includes(Number(this.novoUsuario.perfil))) {
      this.erro = 'Perfil inválido.';
      return;
    }

    this.usuariosService.criarUsuario({
      nome: this.novoUsuario.nome.trim(),
      email: this.novoUsuario.email.trim(),
      senha: this.novoUsuario.senha,
      perfil: Number(this.novoUsuario.perfil)
    }).subscribe({
      next: () => {
        this.sucesso = 'Usuário cadastrado com sucesso!';
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        console.log(err);
        this.erro = err?.error || 'Erro ao cadastrar usuário.';
      }
    });
  }

  nomePerfil(perfil: string): string {
    if (perfil === 'ADMIN') return 'Admin';
    if (perfil === 'FUNCIONARIO') return 'Funcionário';
    if (perfil === 'CLIENTE') return 'Cliente';

    return perfil;
  }

  irParaCadastro() {
    this.router.navigate(['/usuarios/cadastro']);
  }

  voltar() {
    this.router.navigate(['/usuarios']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
