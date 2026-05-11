import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CriarUsuario, Usuario, UsuariosService } from './usuarios';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let httpMock: HttpTestingController;
  const apiUrl = 'https://oficina-api-10.onrender.com/api/auth/usuarios';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve listar usuarios', () => {
    const usuarios: Usuario[] = [{ id: 1, nome: 'Admin', email: 'admin@teste.com', perfil: 'ADMIN' }];

    service.listarUsuarios().subscribe(res => expect(res).toEqual(usuarios));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(usuarios);
  });

  it('deve criar usuario', () => {
    const payload: CriarUsuario = { nome: 'Cliente', email: 'cliente@teste.com', senha: '123456', perfil: 2 };

    service.criarUsuario(payload).subscribe(res => expect(res).toEqual({ ok: true }));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ ok: true });
  });
});
