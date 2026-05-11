import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth';

function tokenComPayload(payload: object): string {
  return ['cabecalho', btoa(JSON.stringify(payload)), 'assinatura'].join('.');
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://oficina-api-10.onrender.com/api/auth';

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve chamar endpoint de login', () => {
    const payload = { email: 'admin@teste.com', senha: '123456' };

    service.login(payload).subscribe(res => expect(res.token).toBe('abc'));

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ token: 'abc' });
  });

  it('deve salvar, buscar e remover token', () => {
    service.salvarToken('token-123');
    expect(service.getToken()).toBe('token-123');
    expect(service.estaLogado()).toBe(true);
    expect(service.isLoggedIn()).toBe(true);

    service.logout();
    expect(service.getToken()).toBeNull();
  });

  it('deve identificar perfis do token', () => {
    service.salvarToken(tokenComPayload({ perfil: 'ADMIN' }));
    expect(service.getPerfil()).toBe('ADMIN');
    expect(service.isAdmin()).toBe(true);
    expect(service.podeGerenciarSistema()).toBe(true);

    service.salvarToken(tokenComPayload({ role: 'FUNCIONARIO' }));
    expect(service.isFuncionario()).toBe(true);
    expect(service.podeGerenciarSistema()).toBe(true);

    service.salvarToken(tokenComPayload({ Perfil: 'CLIENTE' }));
    expect(service.isCliente()).toBe(true);
    expect(service.podeGerenciarSistema()).toBe(false);
  });

  it('deve retornar null quando token for invalido', () => {
    service.salvarToken('token-invalido');
    expect(service.getUsuarioLogado()).toBeNull();
    expect(service.getPerfil()).toBe('');
  });
});

describe('AuthService - cobertura extra', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('deve ler perfil pela claim padrao do token', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'browser' }]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    service.salvarToken(tokenComPayload({ 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'funcionario' }));

    expect(service.getPerfil()).toBe('FUNCIONARIO');
  });

  it('deve retornar valores seguros fora do navegador', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: PLATFORM_ID, useValue: 'server' }]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    service.salvarToken('abc');
    service.saveToken('abc');
    expect(service.getToken()).toBeNull();
    expect(service.estaLogado()).toBe(false);
    expect(service.getUsuarioLogado()).toBeNull();
    service.logout();
  });
});
