import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrdemServico, OrdensServicoService, ResumoOrdens } from './ordens-servico';

describe('OrdensServicoService', () => {
  let service: OrdensServicoService;
  let httpMock: HttpTestingController;
  const apiBase = 'https://oficina-api-10.onrender.com/api';
  const ordensUrl = `${apiBase}/ordens-servico`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(OrdensServicoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve listar ordens, resumo, veiculos e itens', () => {
    const ordem: OrdemServico = { id: 1, veiculoId: 'v1', dataEntrada: '2026-05-07', status: 'Recebida', valorTotal: 0, itens: [] };
    const resumo: ResumoOrdens = { totalOrdens: 1, ordensFinalizadas: 0, tempoMedioHoras: 0 };

    service.getOrdens().subscribe(res => expect(res).toEqual([ordem]));
    const ordensReq = httpMock.expectOne(ordensUrl);
    expect(ordensReq.request.method).toBe('GET');
    ordensReq.flush([ordem]);

    service.getResumo().subscribe(res => expect(res).toEqual(resumo));
    const resumoReq = httpMock.expectOne(`${ordensUrl}/resumo`);
    expect(resumoReq.request.method).toBe('GET');
    resumoReq.flush(resumo);

    service.getVeiculos().subscribe(res => expect(res.length).toBe(1));
    const veiculosReq = httpMock.expectOne(`${apiBase}/veiculos`);
    expect(veiculosReq.request.method).toBe('GET');
    veiculosReq.flush([{ id: 'v1' }]);

    service.getItensDisponiveis().subscribe(res => expect(res.length).toBe(1));
    const itensReq = httpMock.expectOne(`${apiBase}/itens`);
    expect(itensReq.request.method).toBe('GET');
    itensReq.flush([{ id: 1 }]);
  });

  it('deve buscar ordem por id', () => {
    const ordem: OrdemServico = { id: 5, veiculoId: 'v5', dataEntrada: '2026-05-07', status: 'Recebida', valorTotal: 0, itens: [] };

    service.getOrdemById(5).subscribe(res => expect(res).toEqual(ordem));

    const req = httpMock.expectOne(`${ordensUrl}/5`);
    expect(req.request.method).toBe('GET');
    req.flush(ordem);
  });

  it('deve baixar orcamento em PDF', () => {
    const arquivo = new Blob(['pdf'], { type: 'application/pdf' });

    service.baixarOrcamentoPdf(5).subscribe(res => expect(res).toEqual(arquivo));

    const req = httpMock.expectOne(`${ordensUrl}/5/orcamento-pdf`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(arquivo);
  });

  it('deve criar ordem, adicionar item e atualizar status', () => {
    const ordem: OrdemServico = { id: 1, veiculoId: 'v1', dataEntrada: '2026-05-07', status: 'Recebida', valorTotal: 0, itens: [] };

    service.criarOrdem({ veiculoId: 'v1' }).subscribe(res => expect(res).toEqual(ordem));
    const post = httpMock.expectOne(ordensUrl);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ veiculoId: 'v1' });
    post.flush(ordem);

    service.addItem(1, { itemId: '2', quantidade: 3 }).subscribe(res => expect(res).toEqual({ ok: true }));
    const addItem = httpMock.expectOne(`${ordensUrl}/1/itens`);
    expect(addItem.request.method).toBe('POST');
    expect(addItem.request.body).toEqual({ itemId: 2, quantidade: 3 });
    addItem.flush({ ok: true });

    service.atualizarStatus(1, 'Finalizada').subscribe(res => expect(res).toEqual({ ok: true }));
    const statusReq = httpMock.expectOne(`${ordensUrl}/1/status`);
    expect(statusReq.request.method).toBe('PUT');
    expect(statusReq.request.body).toEqual({ status: 'Finalizada' });
    statusReq.flush({ ok: true });
  });
});
