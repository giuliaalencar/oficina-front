import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientesService, Cliente } from './clientes';

describe('ClientesService', () => {
  let service: ClientesService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://oficina-api-10.onrender.com/api/clientes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ClientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve listar clientes', () => {
    const clientes: Cliente[] = [
      { id: '1', nome: 'Giulia', email: 'giulia@email.com', telefone: '11999999999', cpfCnpj: '12345678901' }
    ];

    service.getClientes().subscribe(res => expect(res).toEqual(clientes));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(clientes);
  });

  it('deve buscar cliente por id', () => {
    const cliente: Cliente = { id: '1', nome: 'Giulia', email: 'giulia@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };

    service.getClienteById('1').subscribe(res => expect(res).toEqual(cliente));

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(cliente);
  });

  it('deve criar cliente', () => {
    const payload = { nome: 'Novo', email: 'novo@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };
    const resposta: Cliente = { id: '2', ...payload };

    service.criarCliente(payload).subscribe(res => expect(res).toEqual(resposta));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(resposta);
  });

  it('deve atualizar cliente', () => {
    const cliente: Cliente = { id: '1', nome: 'Atualizado', email: 'a@email.com', telefone: '11999999999', cpfCnpj: '12345678901' };

    service.atualizarCliente(cliente).subscribe(res => expect(res).toEqual(cliente));

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(cliente);
    req.flush(cliente);
  });

  it('deve deletar cliente', () => {
    service.deletarCliente('1').subscribe(res => expect(res).toBeNull());

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
