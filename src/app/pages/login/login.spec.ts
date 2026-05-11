import { of, throwError } from 'rxjs';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let auth: any;
  let router: any;
  let component: LoginComponent;

  beforeEach(() => {
    auth = {
      login: vi.fn(),
      salvarToken: vi.fn(),
      isCliente: vi.fn()
    };
    router = { navigate: vi.fn() };
    component = new LoginComponent(auth, router);
  });

  it('deve exigir email e senha', () => {
    component.entrar();
    expect(component.erro).toBe('Digite seu email.');

    component.email = 'admin@teste.com';
    component.entrar();
    expect(component.erro).toBe('Digite sua senha.');
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('deve salvar token e navegar para clientes quando for admin ou funcionario', () => {
    component.email = 'admin@teste.com';
    component.senha = '123456';
    auth.login.mockReturnValue(of({ token: 'token-admin' }));
    auth.isCliente.mockReturnValue(false);

    component.entrar();

    expect(auth.login).toHaveBeenCalledWith({ email: 'admin@teste.com', senha: '123456' });
    expect(auth.salvarToken).toHaveBeenCalledWith('token-admin');
    expect(router.navigate).toHaveBeenCalledWith(['/clientes']);
    expect(component.carregando).toBe(false);
  });

  it('deve navegar para ordens quando for cliente', () => {
    component.email = 'cliente@teste.com';
    component.senha = '123456';
    auth.login.mockReturnValue(of({ token: 'token-cliente' }));
    auth.isCliente.mockReturnValue(true);

    component.entrar();

    expect(router.navigate).toHaveBeenCalledWith(['/ordens-servico']);
  });

  it('deve mostrar erro de credenciais invalidas', () => {
    component.email = 'admin@teste.com';
    component.senha = 'errada';
    auth.login.mockReturnValue(throwError(() => ({ status: 401 })));

    component.entrar();

    expect(component.erro).toContain('inv');
    expect(component.carregando).toBe(false);
  });

  it('deve tratar login sem token retornado', () => {
    auth.login.mockReturnValue(of({}));
    component.email = ' admin@teste.com ';
    component.senha = '123456';

    component.entrar();

    expect(auth.login).toHaveBeenCalledWith({ email: 'admin@teste.com', senha: '123456' });
    expect(component.erro).toContain('token');
  });

  it('deve tratar API fora do ar e erro generico', () => {
    component.email = 'admin@teste.com';
    component.senha = '123456';

    auth.login.mockReturnValue(throwError(() => ({ status: 0 })));
    component.entrar();
    expect(component.erro).toContain('API');

    auth.login.mockReturnValue(throwError(() => ({ status: 500, error: 'Falha servidor' })));
    component.entrar();
    expect(component.erro).toBe('Falha servidor');

    auth.login.mockReturnValue(throwError(() => ({ status: 500 })));
    component.entrar();
    expect(component.erro).toBe('Erro ao fazer login.');
  });
});
