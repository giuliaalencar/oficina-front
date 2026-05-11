import { of, throwError } from 'rxjs';
import { UsuariosComponent } from './usuarios';
import { Usuario } from '../../services/usuarios';

function criarComponente(url = '/usuarios') {
  const router = { url, navigate: vi.fn() };
  const service = {
    listarUsuarios: vi.fn(),
    criarUsuario: vi.fn()
  };
  const cdr = { detectChanges: vi.fn() };
  const component = new UsuariosComponent(service as any, router as any, cdr as any);
  return { component, router, service };
}

describe('UsuariosComponent', () => {
  const usuario: Usuario = { id: 1, nome: 'Admin', email: 'admin@teste.com', perfil: 'ADMIN' };

  it('deve carregar usuarios na listagem', () => {
    const { component, service } = criarComponente();
    service.listarUsuarios.mockReturnValue(of([usuario]));

    component.ngOnInit();

    expect(component.usuarios).toEqual([usuario]);
  });

  it('deve mostrar erro ao falhar listagem', () => {
    const { component, service } = criarComponente();
    service.listarUsuarios.mockReturnValue(throwError(() => ({ status: 403 })));

    component.carregarUsuarios();

    expect(component.erro).toContain('ADMIN');
  });

  it('deve validar cadastro de usuario', () => {
    const { component } = criarComponente('/usuarios/cadastro');

    component.cadastrarUsuario();
    expect(component.erro).toBe('Informe o nome.');

    component.novoUsuario = { nome: 'Novo', email: '', senha: '', perfil: 2 };
    component.cadastrarUsuario();
    expect(component.erro).toBe('Informe o email.');

    component.novoUsuario = { nome: 'Novo', email: 'novo@teste.com', senha: '', perfil: 2 };
    component.cadastrarUsuario();
    expect(component.erro).toBe('Informe a senha.');

    component.novoUsuario = { nome: 'Novo', email: 'novo@teste.com', senha: '123456', perfil: 9 };
    component.cadastrarUsuario();
    expect(component.erro).toContain('Perfil');
  });

  it('deve cadastrar usuario valido', () => {
    const { component, service, router } = criarComponente('/usuarios/cadastro');
    component.novoUsuario = { nome: 'Novo', email: 'novo@teste.com', senha: '123456', perfil: 2 };
    service.criarUsuario.mockReturnValue(of({ ok: true }));

    component.cadastrarUsuario();

    expect(service.criarUsuario).toHaveBeenCalledWith({ nome: 'Novo', email: 'novo@teste.com', senha: '123456', perfil: 2 });
    expect(router.navigate).toHaveBeenCalledWith(['/usuarios']);
  });

  it('deve traduzir nomes de perfil e navegar', () => {
    const { component, router } = criarComponente();

    expect(component.nomePerfil('ADMIN')).toBe('Admin');
    expect(component.nomePerfil('FUNCIONARIO')).toContain('Funcion');
    expect(component.nomePerfil('CLIENTE')).toBe('Cliente');
    expect(component.nomePerfil('OUTRO')).toBe('OUTRO');

    component.irParaCadastro();
    expect(router.navigate).toHaveBeenCalledWith(['/usuarios/cadastro']);

    component.voltar();
    expect(router.navigate).toHaveBeenCalledWith(['/usuarios']);
  });
});



describe('UsuariosComponent - cobertura extra', () => {
  it('nao deve carregar usuarios quando estiver no modo cadastro', () => {
    const { component, service } = criarComponente('/usuarios/cadastro');

    component.ngOnInit();

    expect(component.modoFormulario).toBe(true);
    expect(service.listarUsuarios).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao cadastrar usuario', () => {
    const { component, service } = criarComponente('/usuarios/cadastro');
    component.novoUsuario = { nome: ' Novo ', email: ' novo@teste.com ', senha: '123456', perfil: 3 };

    service.criarUsuario.mockReturnValue(throwError(() => ({ error: 'Email ja cadastrado' })));
    component.cadastrarUsuario();
    expect(component.erro).toBe('Email ja cadastrado');

    service.criarUsuario.mockReturnValue(throwError(() => ({})));
    component.cadastrarUsuario();
    expect(component.erro).toContain('Erro ao cadastrar');
  });

  it('deve fazer logout', () => {
    const { component, router } = criarComponente();
    localStorage.setItem('token', 'abc');

    component.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

