import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ItensService, Item } from './itens';

describe('ItensService', () => {
  let service: ItensService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://oficina-api-10.onrender.com/api/itens';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ItensService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve listar e buscar itens', () => {
    const item: Item = { id: 1, descricao: 'Pneu', valor: 100, estoque: 3, tipo: 'Peca' };

    service.getItens().subscribe(res => expect(res).toEqual([item]));
    const listReq = httpMock.expectOne(apiUrl);
    expect(listReq.request.method).toBe('GET');
    listReq.flush([item]);

    service.getItemById(1).subscribe(res => expect(res).toEqual(item));
    const byIdReq = httpMock.expectOne(`${apiUrl}/1`);
    expect(byIdReq.request.method).toBe('GET');
    byIdReq.flush(item);
  });

  it('deve criar, atualizar e deletar item', () => {
    const payload = { descricao: 'Pneu', valor: 100, estoque: 3, tipo: 'Peca' };
    const item: Item = { id: 1, ...payload };

    service.criarItem(payload).subscribe(res => expect(res).toEqual(item));
    const post = httpMock.expectOne(apiUrl);
    expect(post.request.method).toBe('POST');
    post.flush(item);

    service.atualizarItem(item).subscribe(res => expect(res).toEqual(item));
    const put = httpMock.expectOne(`${apiUrl}/1`);
    expect(put.request.method).toBe('PUT');
    put.flush(item);

    service.deletarItem(1).subscribe(res => expect(res).toBeNull());
    const del = httpMock.expectOne(`${apiUrl}/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
