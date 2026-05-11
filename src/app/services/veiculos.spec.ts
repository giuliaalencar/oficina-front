import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VeiculosService, Veiculo } from './veiculos';

describe('VeiculosService', () => {
  let service: VeiculosService;
  let httpMock: HttpTestingController;
  const apiBase = 'https://oficina-api-10.onrender.com/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(VeiculosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve listar veiculos', () => {
    const veiculos: Veiculo[] = [
      { id: '1', clienteId: '10', placa: 'ABC1D23', marca: 'Honda', modelo: 'Civic', ano: 2024 }
    ];

    service.getVeiculos().subscribe(res => expect(res).toEqual(veiculos));

    const req = httpMock.expectOne(`${apiBase}/veiculos`);
    expect(req.request.method).toBe('GET');
    req.flush(veiculos);
  });

  it('deve buscar veiculo por id', () => {
    const veiculo: Veiculo = { id: '7', clienteId: '10', placa: 'XYZ1A23', marca: 'Toyota', modelo: 'Corolla', ano: 2025 };

    service.getVeiculoById('7').subscribe(res => expect(res).toEqual(veiculo));

    const req = httpMock.expectOne(`${apiBase}/veiculos/7`);
    expect(req.request.method).toBe('GET');
    req.flush(veiculo);
  });

  it('deve listar clientes para o select', () => {
    const clientes = [{ id: '10', nome: 'Cliente' }];

    service.getClientes().subscribe(res => expect(res).toEqual(clientes));

    const req = httpMock.expectOne(`${apiBase}/clientes`);
    expect(req.request.method).toBe('GET');
    req.flush(clientes);
  });

  it('deve criar, atualizar e deletar veiculo', () => {
    const payload = { clienteId: '10', placa: 'ABC1D23', marca: 'Honda', modelo: 'Civic', ano: 2024 };
    const veiculo: Veiculo = { id: '1', ...payload };

    service.criarVeiculo(payload).subscribe(res => expect(res).toEqual(veiculo));
    const post = httpMock.expectOne(`${apiBase}/veiculos`);
    expect(post.request.method).toBe('POST');
    post.flush(veiculo);

    service.atualizarVeiculo(veiculo).subscribe(res => expect(res).toEqual(veiculo));
    const put = httpMock.expectOne(`${apiBase}/veiculos/1`);
    expect(put.request.method).toBe('PUT');
    put.flush(veiculo);

    service.deletarVeiculo('1').subscribe(res => expect(res).toBeNull());
    const del = httpMock.expectOne(`${apiBase}/veiculos/1`);
    expect(del.request.method).toBe('DELETE');
    del.flush(null);
  });
});
