import { of, throwError } from 'rxjs';
import { ItensComponent } from './itens';
import { Item } from '../../services/itens';

function criarComponente(url = '/itens') {
  const router = { url, navigate: vi.fn() };
  const route = { queryParamMap: of(new Map<string, string>()) };
  const service = {
    getItens: vi.fn(),
    getItemById: vi.fn(),
    criarItem: vi.fn(),
    atualizarItem: vi.fn(),
    deletarItem: vi.fn()
  };
  const cdr = { detectChanges: vi.fn() };
  const component = new ItensComponent(router as any, route as any, service as any, cdr as any);
  return { component, router, service };
}

describe('ItensComponent', () => {
  const item: Item = { id: 1, descricao: 'Pneu', valor: 100, estoque: 5, tipo: 'Peca' };

  it('deve carregar itens', () => {
    const { component, service } = criarComponente();
    service.getItens.mockReturnValue(of([item]));

    component.ngOnInit();

    expect(component.itens).toEqual([item]);
  });

  it('deve validar campos do item', () => {
    const { component } = criarComponente('/itens/cadastro');

    component.novoItem = { descricao: '', valor: 0, estoque: -1, tipo: '' };
    expect(component.validarFormulario()).toBe(false);
    expect(component.errosCampos['descricao']).toBeTruthy();
    expect(component.errosCampos['valor']).toBeTruthy();
    expect(component.errosCampos['estoque']).toBeTruthy();
    expect(component.errosCampos['tipo']).toBeTruthy();
  });

  it('deve criar, editar e deletar item', () => {
    const { component, service, router } = criarComponente('/itens/cadastro');
    component.novoItem = { descricao: 'Pneu', valor: 100, estoque: 5, tipo: 'Peca' };
    service.criarItem.mockReturnValue(of(item));

    component.salvarItem();

    expect(service.criarItem).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/itens']);

    component.editando = item;
    service.atualizarItem.mockReturnValue(of(item));
    component.salvarItem();
    expect(service.atualizarItem).toHaveBeenCalled();

    service.deletarItem.mockReturnValue(of(null));
    service.getItens.mockReturnValue(of([]));
    component.deletarItem(1);
    expect(service.deletarItem).toHaveBeenCalledWith(1);
  });

  it('deve mostrar erro ao falhar listagem', () => {
    const { component, service } = criarComponente();
    service.getItens.mockReturnValue(throwError(() => ({ status: 500 })));

    component.carregarItens();

    expect(component.erro).toBe('Erro ao carregar itens');
  });
});

describe('ItensComponent - cobertura extra', () => {
  const itemExtra: Item = { id: 9, descricao: 'Oleo', valor: 50, estoque: 3, tipo: 'Servico' };

  function criarComQuery(itemId: string | null) {
    const router = { url: '/itens/cadastro', navigate: vi.fn() };
    const params = new Map<string, string>();
    if (itemId) params.set('itemId', itemId);
    const route = { queryParamMap: of(params) };
    const service = {
      getItens: vi.fn(), getItemById: vi.fn(), criarItem: vi.fn(), atualizarItem: vi.fn(), deletarItem: vi.fn()
    };
    const cdr = { detectChanges: vi.fn() };
    const component = new ItensComponent(router as any, route as any, service as any, cdr as any);
    return { component, router, service };
  }

  it('deve carregar item para edicao via query string', () => {
    const { component, service } = criarComQuery('9');
    service.getItemById.mockReturnValue(of(itemExtra));

    component.ngOnInit();

    expect(component.editando).toEqual(itemExtra);
    expect(component.novoItem.descricao).toBe('Oleo');
  });

  it('deve tratar erro ao carregar item para edicao', () => {
    const { component, service } = criarComQuery('9');
    service.getItemById.mockReturnValue(throwError(() => ({ status: 404 })));

    component.ngOnInit();

    expect(component.erro).toContain('Item');
  });

  it('deve validar item correto', () => {
    const { component } = criarComponente('/itens/cadastro');
    component.novoItem = { descricao: 'Oleo', valor: 50, estoque: 0, tipo: 'Servico' };

    expect(component.validarFormulario()).toBe(true);
  });

  it('deve tratar erro ao criar item', () => {
    const { component, service } = criarComponente('/itens/cadastro');
    component.novoItem = { descricao: 'Oleo', valor: 50, estoque: 3, tipo: 'Servico' };

    service.criarItem.mockReturnValue(throwError(() => ({ error: 'Falha ao criar' })));
    component.criarItem();
    expect(component.erro).toBe('Falha ao criar');

    service.criarItem.mockReturnValue(throwError(() => ({})));
    component.criarItem();
    expect(component.erro).toBe('Erro ao cadastrar item');
  });

  it('deve tratar salvar edicao sem item e erros de atualizacao', () => {
    const { component, service } = criarComponente('/itens/cadastro');
    component.salvarEdicao();
    expect(service.atualizarItem).not.toHaveBeenCalled();

    component.editando = itemExtra;
    component.novoItem = { descricao: 'Oleo', valor: 50, estoque: 3, tipo: 'Servico' };
    service.atualizarItem.mockReturnValue(throwError(() => ({ error: 'Falha ao editar' })));
    component.salvarEdicao();
    expect(component.erro).toBe('Falha ao editar');

    service.atualizarItem.mockReturnValue(throwError(() => ({})));
    component.salvarEdicao();
    expect(component.erro).toBe('Erro ao atualizar item');
  });

  it('deve navegar, deletar com erro e logout', () => {
    const { component, router, service } = criarComponente();

    component.irParaCadastro();
    expect(router.navigate).toHaveBeenCalledWith(['/itens/cadastro']);

    component.irParaEdicao(itemExtra);
    expect(router.navigate).toHaveBeenCalledWith(['/itens/cadastro'], { queryParams: { itemId: 9 } });

    service.deletarItem.mockReturnValue(throwError(() => ({ status: 500 })));
    component.deletarItem(9);
    expect(component.erro).toBe('Erro ao excluir item');

    component.voltar();
    expect(router.navigate).toHaveBeenCalledWith(['/itens']);

    localStorage.setItem('token', 'abc');
    component.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('deve parar salvamento quando formulario de item for invalido', () => {
    const { component, service } = criarComponente('/itens/cadastro');
    component.novoItem = { descricao: '', valor: 0, estoque: 0, tipo: '' };

    component.salvarItem();

    expect(service.criarItem).not.toHaveBeenCalled();
    expect(service.atualizarItem).not.toHaveBeenCalled();
    expect(component.errosCampos['descricao']).toBeTruthy();
  });
  it('deve abrir cadastro sem itemId sem carregar edicao', () => {
    const { component, service } = criarComQuery(null);

    component.ngOnInit();

    expect(service.getItemById).not.toHaveBeenCalled();
  });
});

