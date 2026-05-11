import { of, throwError } from 'rxjs';
import { VeiculosComponent } from './veiculos';
import { Veiculo } from '../../services/veiculos';

function criarComponente(url = '/veiculos') {
  const router = { url, navigate: vi.fn() };
  const route = { queryParamMap: of(new Map<string, string>()) };
  const service = {
    getVeiculos: vi.fn(),
    getVeiculoById: vi.fn(),
    getClientes: vi.fn(),
    criarVeiculo: vi.fn(),
    atualizarVeiculo: vi.fn(),
    deletarVeiculo: vi.fn()
  };
  const cdr = { detectChanges: vi.fn() };
  const component = new VeiculosComponent(router as any, route as any, service as any, cdr as any);
  return { component, router, service };
}

describe('VeiculosComponent', () => {
  const veiculo: Veiculo = { id: '1', clienteId: 'c1', placa: 'ABC1D23', marca: 'Honda', modelo: 'Civic', ano: 2024 };

  it('deve carregar veiculos e clientes', () => {
    const { component, service } = criarComponente();
    service.getClientes.mockReturnValue(of([{ id: 'c1', nome: 'Giulia' }]));
    service.getVeiculos.mockReturnValue(of([veiculo]));

    component.ngOnInit();

    expect(component.clientes.length).toBe(1);
    expect(component.veiculos).toEqual([veiculo]);
  });

  it('deve validar placa e campos obrigatorios', () => {
    const { component } = criarComponente('/veiculos/cadastro');

    expect(component.validarFormulario()).toBe(false);
    expect(component.errosCampos['clienteId']).toBeTruthy();

    component.novoVeiculo = { clienteId: 'c1', placa: 'ERRADA', marca: 'Honda', modelo: 'Civic', ano: 2024 };
    expect(component.validarFormulario()).toBe(false);
    expect(component.errosCampos['placa']).toBeTruthy();
  });

  it('deve criar, editar e deletar veiculo', () => {
    const { component, service, router } = criarComponente('/veiculos/cadastro');
    component.novoVeiculo = { clienteId: 'c1', placa: 'ABC1D23', marca: 'Honda', modelo: 'Civic', ano: 2024 };
    service.criarVeiculo.mockReturnValue(of(veiculo));

    component.salvarVeiculo();

    expect(service.criarVeiculo).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/veiculos']);

    component.editando = veiculo;
    service.atualizarVeiculo.mockReturnValue(of(veiculo));
    component.salvarVeiculo();
    expect(service.atualizarVeiculo).toHaveBeenCalled();

    service.deletarVeiculo.mockReturnValue(of(null));
    service.getVeiculos.mockReturnValue(of([]));
    component.deletarVeiculo('1');
    expect(service.deletarVeiculo).toHaveBeenCalledWith('1');
  });

  it('deve mostrar erro ao falhar carregamento', () => {
    const { component, service } = criarComponente();
    service.getVeiculos.mockReturnValue(throwError(() => ({ status: 500 })));

    component.carregarVeiculos();

    expect(component.erro).toContain('Erro');
  });
});

describe('VeiculosComponent - cobertura extra', () => {
  const veiculoExtra: Veiculo = { id: '9', clienteId: 'c9', placa: 'ABC1234', marca: 'Toyota', modelo: 'Corolla', ano: 2020 };

  function criarComQuery(veiculoId: string | null) {
    const router = { url: '/veiculos/cadastro', navigate: vi.fn() };
    const params = new Map<string, string>();
    if (veiculoId) params.set('veiculoId', veiculoId);
    const route = { queryParamMap: of(params) };
    const service = {
      getVeiculos: vi.fn(), getVeiculoById: vi.fn(), getClientes: vi.fn(), criarVeiculo: vi.fn(), atualizarVeiculo: vi.fn(), deletarVeiculo: vi.fn()
    };
    const cdr = { detectChanges: vi.fn() };
    const component = new VeiculosComponent(router as any, route as any, service as any, cdr as any);
    return { component, router, service };
  }

  it('deve carregar veiculo para edicao via query string', () => {
    const { component, service } = criarComQuery('9');
    service.getClientes.mockReturnValue(of([]));
    service.getVeiculoById.mockReturnValue(of(veiculoExtra));

    component.ngOnInit();

    expect(component.editando).toEqual(veiculoExtra);
    expect(component.novoVeiculo.placa).toBe('ABC1234');
  });

  it('deve tratar erros de carregamento de clientes e edicao', () => {
    const { component, service } = criarComQuery('9');
    service.getClientes.mockReturnValue(throwError(() => ({ status: 500 })));
    service.getVeiculoById.mockReturnValue(throwError(() => ({ status: 404 })));

    component.ngOnInit();

    expect(component.erro).toContain('Ve');
  });

  it('deve validar todos os campos e aceitar placas validas', () => {
    const { component } = criarComponente('/veiculos/cadastro');
    component.novoVeiculo = { clienteId: 'c1', placa: 'ABC1234', marca: 'Honda', modelo: 'Civic', ano: 2024 };
    expect(component.validarFormulario()).toBe(true);

    component.novoVeiculo = { clienteId: 'c1', placa: 'ABC1D23', marca: '', modelo: '', ano: 0 };
    expect(component.validarFormulario()).toBe(false);
    expect(component.errosCampos['marca']).toBeTruthy();
    expect(component.errosCampos['modelo']).toBeTruthy();
    expect(component.errosCampos['ano']).toBeTruthy();
  });

  it('deve tratar erros ao criar veiculo', () => {
    const { component, service } = criarComponente('/veiculos/cadastro');
    component.novoVeiculo = { clienteId: 'c1', placa: 'ABC1D23', marca: 'Honda', modelo: 'Civic', ano: 2024 };

    service.criarVeiculo.mockReturnValue(throwError(() => ({ error: 'ERR_002 - Placa invalida' })));
    component.criarVeiculo();
    expect(component.errosCampos['placa']).toBeTruthy();

    service.criarVeiculo.mockReturnValue(throwError(() => ({ error: 'Falha geral' })));
    component.criarVeiculo();
    expect(component.erro).toBe('Falha geral');

    service.criarVeiculo.mockReturnValue(throwError(() => ({})));
    component.criarVeiculo();
    expect(component.erro).toContain('Erro ao cadastrar');
  });

  it('deve tratar salvar edicao sem veiculo e erros de atualizacao', () => {
    const { component, service } = criarComponente('/veiculos/cadastro');
    component.salvarEdicao();
    expect(service.atualizarVeiculo).not.toHaveBeenCalled();

    component.editando = veiculoExtra;
    component.novoVeiculo = { clienteId: 'c9', placa: 'ABC1D23', marca: 'Toyota', modelo: 'Corolla', ano: 2020 };

    service.atualizarVeiculo.mockReturnValue(throwError(() => ({ error: 'ERR_002 - Placa invalida' })));
    component.salvarEdicao();
    expect(component.errosCampos['placa']).toBeTruthy();

    service.atualizarVeiculo.mockReturnValue(throwError(() => ({ error: 'Falha ao editar' })));
    component.salvarEdicao();
    expect(component.erro).toBe('Falha ao editar');

    service.atualizarVeiculo.mockReturnValue(throwError(() => ({})));
    component.salvarEdicao();
    expect(component.erro).toContain('Erro ao atualizar');
  });

  it('deve navegar, deletar com erro, buscar nome e logout', () => {
    const { component, router, service } = criarComponente();

    component.irParaCadastro();
    expect(router.navigate).toHaveBeenCalledWith(['/veiculos/cadastro']);

    component.irParaEdicao(veiculoExtra);
    expect(router.navigate).toHaveBeenCalledWith(['/veiculos/cadastro'], { queryParams: { veiculoId: '9' } });

    service.deletarVeiculo.mockReturnValue(throwError(() => ({ status: 500 })));
    component.deletarVeiculo('9');
    expect(component.erro).toContain('Erro ao excluir');

    component.clientes = [{ id: 'c9', nome: 'Ana' }];
    expect(component.nomeCliente('c9')).toBe('Ana');
    expect(component.nomeCliente('x')).toContain('Cliente');

    component.voltar();
    expect(router.navigate).toHaveBeenCalledWith(['/veiculos']);

    localStorage.setItem('token', 'abc');
    component.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('deve parar salvamento quando formulario de veiculo for invalido', () => {
    const { component, service } = criarComponente('/veiculos/cadastro');

    component.salvarVeiculo();

    expect(service.criarVeiculo).not.toHaveBeenCalled();
    expect(service.atualizarVeiculo).not.toHaveBeenCalled();
    expect(component.errosCampos['clienteId']).toBeTruthy();
  });
  it('deve abrir cadastro sem veiculoId sem carregar edicao', () => {
    const { component, service } = criarComQuery(null);
    service.getClientes.mockReturnValue(of([]));

    component.ngOnInit();

    expect(service.getVeiculoById).not.toHaveBeenCalled();
  });
});


