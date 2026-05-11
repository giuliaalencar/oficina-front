import { of, throwError } from 'rxjs';
import { OrdensServicoComponent } from './ordens-servico';
import { OrdemServico, ResumoOrdens } from '../../services/ordens-servico';

function criarComponente(url = '/ordens-servico', podeGerenciar = true) {
  const router = { url, navigate: vi.fn() };
  const service = {
    getResumo: vi.fn(),
    getOrdens: vi.fn(),
    getOrdemById: vi.fn(),
    criarOrdem: vi.fn(),
    getVeiculos: vi.fn(),
    getItensDisponiveis: vi.fn(),
    addItem: vi.fn(),
    atualizarStatus: vi.fn()
  };
  const cdr = { detectChanges: vi.fn() };
  const authService = { podeGerenciarSistema: vi.fn().mockReturnValue(podeGerenciar) };
  const component = new OrdensServicoComponent(router as any, service as any, cdr as any, authService as any);
  return { component, router, service };
}

describe('OrdensServicoComponent', () => {
  const ordem: OrdemServico = { id: 1, veiculoId: 'v1', dataEntrada: '2026-05-07', status: 'Recebida', valorTotal: 0, itens: [] };
  const resumo: ResumoOrdens = { totalOrdens: 1, ordensFinalizadas: 0, tempoMedioHoras: 2 };

  it('deve carregar ordens e resumo na listagem para admin ou funcionario', () => {
    const { component, service } = criarComponente('/ordens-servico', true);
    service.getOrdens.mockReturnValue(of([ordem]));
    service.getResumo.mockReturnValue(of(resumo));

    component.ngOnInit();

    expect(component.ordens).toEqual([ordem]);
    expect(component.resumo).toEqual(resumo);
  });

  it('deve carregar veiculos e itens no cadastro', () => {
    const { component, service } = criarComponente('/ordens-servico/cadastro', true);
    service.getVeiculos.mockReturnValue(of([{ id: 'v1', placa: 'ABC1D23' }]));
    service.getItensDisponiveis.mockReturnValue(of([{ id: 1, descricao: 'Pneu' }]));

    component.ngOnInit();

    expect(component.veiculos.length).toBe(1);
    expect(component.itensDisponiveis.length).toBe(1);
  });

  it('nao deve carregar veiculos e itens quando perfil nao gerencia sistema', () => {
    const { component, service } = criarComponente('/ordens-servico/cadastro', false);

    component.carregarVeiculos();
    component.carregarItens();

    expect(service.getVeiculos).not.toHaveBeenCalled();
    expect(service.getItensDisponiveis).not.toHaveBeenCalled();
  });

  it('deve validar e criar ordem', () => {
    const { component, service, router } = criarComponente('/ordens-servico/cadastro', true);

    expect(component.validarNovaOrdem()).toBe(false);
    expect(component.errosCampos['veiculoId']).toBeTruthy();

    component.novaOrdem.veiculoId = 'v1';
    service.criarOrdem.mockReturnValue(of(ordem));

    component.criarOrdem();

    expect(service.criarOrdem).toHaveBeenCalledWith({ veiculoId: 'v1' });
    expect(router.navigate).toHaveBeenCalledWith(['/ordens-servico']);
  });

  it('deve selecionar ordem e adicionar item', () => {
    const { component, service } = criarComponente();
    service.getOrdemById.mockReturnValue(of({ ...ordem, itens: [] }));
    service.addItem.mockReturnValue(of({ ok: true }));
    service.getOrdens.mockReturnValue(of([ordem]));
    service.getResumo.mockReturnValue(of(resumo));

    component.selecionarOrdem(ordem);
    expect(component.ordemSelecionada.id).toBe(1);

    component.novoItem = { itemId: '2', quantidade: 1 };
    component.adicionarItem();

    expect(service.addItem).toHaveBeenCalledWith(1, { itemId: '2', quantidade: 1 });
  });

  it('deve bloquear item sem ordem selecionada', () => {
    const { component } = criarComponente();

    component.adicionarItem();

    expect(component.erro).toBe('Selecione uma ordem primeiro');
  });

  it('deve atualizar status e tratar estoque indisponivel', () => {
    const { component, service } = criarComponente();
    service.atualizarStatus.mockReturnValue(of({ ok: true }));
    service.getOrdens.mockReturnValue(of([ordem]));
    service.getResumo.mockReturnValue(of(resumo));

    component.atualizarStatus(ordem, 'Em Diagnostico');

    expect(service.atualizarStatus).toHaveBeenCalledWith(1, 'Em Diagnostico');
    expect(component.sucesso).toBeTruthy();

    service.atualizarStatus.mockReturnValue(throwError(() => ({ error: 'ERR_003 - Estoque insuficiente' })));
    component.atualizarStatus(ordem, 'Finalizada');

    expect(component.erro).toContain('Estoque');
  });

  it('deve montar nomes e proximo status', () => {
    const { component } = criarComponente();
    component.veiculos = [{ id: 'v1', placa: 'ABC1D23', marca: 'Honda', modelo: 'Civic' }];

    expect(component.nomeVeiculo('v1')).toContain('ABC1D23');
    expect(component.nomeVeiculo('nao-existe')).toContain('n');
    expect(component.nomeVeiculoDaOrdem({ veiculo: { placa: 'AAA1A11', marca: 'Toyota', modelo: 'Corolla' } })).toContain('AAA1A11');
    expect(component.proximoStatus('Recebida')).toBeTruthy();
    expect(component.proximoStatus('Entregue')).toBeNull();
  });
});

describe('OrdensServicoComponent - cobertura extra', () => {
  const ordemExtra: OrdemServico = { id: 2, veiculoId: 'v2', dataEntrada: '2026-05-08', status: 'Em DiagnÃ³stico', valorTotal: 100, itens: [] };
  const resumoExtra: ResumoOrdens = { totalOrdens: 2, ordensFinalizadas: 1, tempoMedioHoras: 4 };

  it('nao deve carregar resumo quando perfil nao gerencia', () => {
    const { component, service } = criarComponente('/ordens-servico', false);

    component.carregarResumo();

    expect(service.getResumo).not.toHaveBeenCalled();
  });

  it('deve tratar erro ao carregar resumo, ordens, veiculos e itens', () => {
    const { component, service } = criarComponente('/ordens-servico/cadastro', true);

    service.getResumo.mockReturnValue(throwError(() => ({ status: 500 })));
    component.carregarResumo();
    expect(service.getResumo).toHaveBeenCalled();

    service.getOrdens.mockReturnValue(throwError(() => ({ status: 500 })));
    component.carregarOrdens();
    expect(component.erro).toContain('ordens');

    service.getVeiculos.mockReturnValue(throwError(() => ({ status: 500 })));
    component.carregarVeiculos();
    expect(component.erro).toContain('ve');

    service.getItensDisponiveis.mockReturnValue(throwError(() => ({ status: 500 })));
    component.carregarItens();
    expect(component.erro).toContain('itens');
  });

  it('deve tratar erro ao criar ordem', () => {
    const { component, service } = criarComponente('/ordens-servico/cadastro', true);
    component.novaOrdem.veiculoId = 'v2';

    service.criarOrdem.mockReturnValue(throwError(() => ({ error: 'Falha ao criar ordem' })));
    component.criarOrdem();
    expect(component.erro).toBe('Falha ao criar ordem');

    service.criarOrdem.mockReturnValue(throwError(() => ({})));
    component.criarOrdem();
    expect(component.erro).toContain('Erro ao criar ordem');
  });

  it('deve tratar erro ao selecionar ordem', () => {
    const { component, service } = criarComponente();
    service.getOrdemById.mockReturnValue(throwError(() => ({ status: 500 })));

    component.selecionarOrdem(ordemExtra);

    expect(component.abaAtiva).toBe('dados');
    expect(component.erro).toBe('Erro ao buscar detalhes da ordem');
  });

  it('deve validar item da ordem', () => {
    const { component } = criarComponente();

    component.novoItem = { itemId: '', quantidade: 0 };
    expect(component.validarItemOrdem()).toBe(false);
    expect(component.errosCampos['itemId']).toBeTruthy();
    expect(component.errosCampos['quantidade']).toBeTruthy();

    component.novoItem = { itemId: '1', quantidade: 2 };
    expect(component.validarItemOrdem()).toBe(true);
  });

  it('deve tratar adicionar item invalido e erro da API', () => {
    const { component, service } = criarComponente();
    component.ordemSelecionada = { id: 2 };

    component.novoItem = { itemId: '', quantidade: 0 };
    component.adicionarItem();
    expect(service.addItem).not.toHaveBeenCalled();

    component.novoItem = { itemId: '1', quantidade: 1 };
    service.addItem.mockReturnValue(throwError(() => ({ error: 'Sem estoque' })));
    component.adicionarItem();
    expect(component.erro).toBe('Sem estoque');

    service.addItem.mockReturnValue(throwError(() => ({})));
    component.adicionarItem();
    expect(component.erro).toBe('Erro ao adicionar item');
  });

  it('deve recarregar ordem selecionada ao atualizar status', () => {
    const { component, service } = criarComponente();
    component.ordemSelecionada = { id: 2 };
    service.atualizarStatus.mockReturnValue(of({ ok: true }));
    service.getOrdens.mockReturnValue(of([ordemExtra]));
    service.getResumo.mockReturnValue(of(resumoExtra));
    service.getOrdemById.mockReturnValue(of(ordemExtra));

    component.atualizarStatus(ordemExtra, 'Finalizada');

    expect(service.getOrdemById).toHaveBeenCalledWith(2);
    expect(component.sucesso).toContain('Status');
  });

  it('deve tratar erros diferentes ao atualizar status', () => {
    const { component, service } = criarComponente();

    service.atualizarStatus.mockReturnValue(throwError(() => ({ error: 'Erro textual' })));
    component.atualizarStatus(ordemExtra, 'Finalizada');
    expect(component.erro).toBe('Erro textual');

    service.atualizarStatus.mockReturnValue(throwError(() => ({ error: { mensagem: 'objeto' } })));
    component.atualizarStatus(ordemExtra, 'Finalizada');
    expect(component.erro).toBe('Erro ao atualizar status da ordem.');
  });

  it('deve montar nome do veiculo da ordem pelo veiculoId e navegar', () => {
    const { component, router } = criarComponente();
    component.veiculos = [{ id: 'v2', placa: 'XYZ1A23', marca: 'Fiat', modelo: 'Argo' }];

    expect(component.nomeVeiculoDaOrdem({ veiculoId: 'v2' })).toContain('XYZ1A23');
    const diagnostico = component.proximoStatus('Recebida');
    expect(diagnostico).toContain('Diagn');

    const aguardando = component.proximoStatus(diagnostico as string);
    expect(aguardando).toContain('Aguardando');

    const execucao = component.proximoStatus(aguardando as string);
    expect(execucao).toContain('Execu');

    expect(component.proximoStatus(execucao as string)).toBe('Finalizada');
    expect(component.proximoStatus('Finalizada')).toBe('Entregue');

    component.irParaCadastro();
    expect(router.navigate).toHaveBeenCalledWith(['/ordens-servico/cadastro']);

    component.voltar();
    expect(router.navigate).toHaveBeenCalledWith(['/ordens-servico']);

    localStorage.setItem('token', 'abc');
    component.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('deve parar criacao quando ordem estiver invalida', () => {
    const { component, service } = criarComponente('/ordens-servico/cadastro', true);

    component.criarOrdem();

    expect(service.criarOrdem).not.toHaveBeenCalled();
    expect(component.errosCampos['veiculoId']).toBeTruthy();
  });
  it('nao deve carregar resumo quando perfil nao gerencia sistema na listagem', () => {
    const { component, service } = criarComponente('/ordens-servico', false);
    service.getOrdens.mockReturnValue(of([]));

    component.ngOnInit();

    expect(service.getOrdens).toHaveBeenCalled();
    expect(service.getResumo).not.toHaveBeenCalled();
  });
});



