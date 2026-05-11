import { of, throwError } from 'rxjs';
import { ClientesComponent } from './clientes';
import { Cliente } from '../../services/clientes';

function criarComponente(url = '/clientes') {
  const router = { url, navigate: vi.fn() };
  const route = { queryParamMap: of(new Map<string, string>()) };
  const service = {
    getClientes: vi.fn(),
    getClienteById: vi.fn(),
    criarCliente: vi.fn(),
    atualizarCliente: vi.fn(),
    deletarCliente: vi.fn()
  };
  const cdr = { detectChanges: vi.fn() };
  const component = new ClientesComponent(router as any, route as any, service as any, cdr as any);
  return { component, router, service, cdr };
}

describe('ClientesComponent', () => {
  const cliente: Cliente = { id: '1', nome: 'Giulia', email: 'giulia@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };

  it('deve carregar clientes na listagem', () => {
    const { component, service } = criarComponente();
    service.getClientes.mockReturnValue(of([cliente]));

    component.ngOnInit();

    expect(component.clientes).toEqual([cliente]);
    expect(service.getClientes).toHaveBeenCalled();
  });

  it('deve mostrar erro ao falhar listagem', () => {
    const { component, service } = criarComponente();
    service.getClientes.mockReturnValue(throwError(() => ({ status: 500 })));

    component.carregarClientes();

    expect(component.erro).toBe('Erro ao carregar clientes');
  });

  it('deve validar campos obrigatorios e CPF/CNPJ', () => {
    const { component } = criarComponente('/clientes/cadastro');

    expect(component.validarFormulario()).toBe(false);
    expect(component.errosCampos['nome']).toBeTruthy();

    component.novoCliente = { nome: 'Giulia', email: 'g@email.com', telefone: '11999999999', cpfCnpj: '123' };
    expect(component.validarFormulario()).toBe(false);
    expect(component.errosCampos['cpfCnpj']).toBeTruthy();
  });

  it('deve criar cliente valido', () => {
    const { component, service, router } = criarComponente('/clientes/cadastro');
    component.novoCliente = { nome: 'Giulia', email: 'g@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };
    service.criarCliente.mockReturnValue(of(cliente));

    component.salvarCliente();

    expect(service.criarCliente).toHaveBeenCalledWith(component.novoCliente);
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('deve editar e deletar cliente', () => {
    const { component, service, router } = criarComponente('/clientes/cadastro');
    component.editando = cliente;
    component.novoCliente = { nome: 'Atualizado', email: 'a@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };
    service.atualizarCliente.mockReturnValue(of(cliente));

    component.salvarCliente();

    expect(service.atualizarCliente).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);

    service.deletarCliente.mockReturnValue(of(null));
    service.getClientes.mockReturnValue(of([]));
    component.deletarCliente('1');

    expect(service.deletarCliente).toHaveBeenCalledWith('1');
  });
});

// Cobertura extra para fechar linhas e fluxos alternativos
describe('ClientesComponent - cobertura extra', () => {
  const clienteExtra: Cliente = { id: '9', nome: 'Ana', email: 'ana@email.com', telefone: '11999999999', cpfCnpj: '12345678901234' };

  function criarComQuery(clienteId: string | null) {
    const router = { url: '/clientes/cadastro', navigate: vi.fn() };
    const params = new Map<string, string>();
    if (clienteId) params.set('clienteId', clienteId);
    const route = { queryParamMap: of(params) };
    const service = {
      getClientes: vi.fn(), getClienteById: vi.fn(), criarCliente: vi.fn(), atualizarCliente: vi.fn(), deletarCliente: vi.fn()
    };
    const cdr = { detectChanges: vi.fn() };
    const component = new ClientesComponent(router as any, route as any, service as any, cdr as any);
    return { component, router, service, cdr };
  }

  it('deve carregar cliente para edicao via query string', () => {
    const { component, service } = criarComQuery('9');
    service.getClienteById.mockReturnValue(of(clienteExtra));

    component.ngOnInit();

    expect(component.editando).toEqual(clienteExtra);
    expect(component.novoCliente.nome).toBe('Ana');
  });

  it('deve mostrar erro quando cliente da edicao nao existe', () => {
    const { component, service } = criarComQuery('9');
    service.getClienteById.mockReturnValue(throwError(() => ({ status: 404 })));

    component.ngOnInit();

    expect(component.erro).toContain('Cliente');
  });

  it('deve validar formulario completo com documento valido', () => {
    const { component } = criarComponente('/clientes/cadastro');
    component.novoCliente = { nome: 'Ana', email: 'ana@email.com', telefone: '11999999999', cpfCnpj: '12345678901234' };

    expect(component.validarFormulario()).toBe(true);
    expect(component.errosCampos).toEqual({});
  });

  it('deve tratar erros ao criar cliente', () => {
    const { component, service } = criarComponente('/clientes/cadastro');
    component.novoCliente = { nome: 'Ana', email: 'ana@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };

    service.criarCliente.mockReturnValue(throwError(() => ({ error: 'ERR_001 - Documento invalido' })));
    component.criarCliente();
    expect(component.errosCampos['cpfCnpj']).toBeTruthy();

    service.criarCliente.mockReturnValue(throwError(() => ({ error: 'Falha geral' })));
    component.criarCliente();
    expect(component.erro).toBe('Falha geral');

    service.criarCliente.mockReturnValue(throwError(() => ({})));
    component.criarCliente();
    expect(component.erro).toBe('Erro ao criar cliente');
  });

  it('deve tratar salvar edicao sem cliente e erros de atualizacao', () => {
    const { component, service } = criarComponente('/clientes/cadastro');
    component.salvarEdicao();
    expect(service.atualizarCliente).not.toHaveBeenCalled();

    component.editando = clienteExtra;
    component.novoCliente = { nome: 'Ana', email: 'ana@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };

    service.atualizarCliente.mockReturnValue(throwError(() => ({ error: 'ERR_001 - Documento invalido' })));
    component.salvarEdicao();
    expect(component.errosCampos['cpfCnpj']).toBeTruthy();

    service.atualizarCliente.mockReturnValue(throwError(() => ({ error: 'Falha ao editar' })));
    component.salvarEdicao();
    expect(component.erro).toBe('Falha ao editar');

    service.atualizarCliente.mockReturnValue(throwError(() => ({})));
    component.salvarEdicao();
    expect(component.erro).toBe('Erro ao atualizar cliente');
  });

  it('deve navegar, voltar, deletar com erro e fazer logout', () => {
    const { component, router, service } = criarComponente();

    component.irParaCadastro();
    expect(router.navigate).toHaveBeenCalledWith(['/clientes/cadastro']);

    component.irParaEdicao(clienteExtra);
    expect(router.navigate).toHaveBeenCalledWith(['/clientes/cadastro'], { queryParams: { clienteId: '9' } });

    service.deletarCliente.mockReturnValue(throwError(() => ({ status: 500 })));
    component.deletarCliente('9');
    expect(component.erro).toBe('Erro ao deletar cliente');

    component.voltar();
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);

    localStorage.setItem('token', 'abc');
    component.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('deve parar salvamento quando formulario de cliente for invalido', () => {
    const { component, service } = criarComponente('/clientes/cadastro');

    component.salvarCliente();

    expect(service.criarCliente).not.toHaveBeenCalled();
    expect(service.atualizarCliente).not.toHaveBeenCalled();
    expect(component.errosCampos['nome']).toBeTruthy();
  });
  it('deve abrir cadastro sem clienteId sem carregar edicao', () => {
    const { component, service } = criarComQuery(null);

    component.ngOnInit();

    expect(service.getClienteById).not.toHaveBeenCalled();
  });
});


