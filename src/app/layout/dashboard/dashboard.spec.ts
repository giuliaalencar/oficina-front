import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let auth: any;
  let router: any;
  let component: DashboardComponent;

  beforeEach(() => {
    auth = {
      isAdmin: vi.fn(),
      isFuncionario: vi.fn(),
      isCliente: vi.fn(),
      podeGerenciarSistema: vi.fn(),
      logout: vi.fn()
    };
    router = { navigate: vi.fn() };
    component = new DashboardComponent(auth, router);
  });

  it('deve consultar perfis pelo AuthService', () => {
    auth.isAdmin.mockReturnValue(true);
    auth.isFuncionario.mockReturnValue(false);
    auth.isCliente.mockReturnValue(false);
    auth.podeGerenciarSistema.mockReturnValue(true);

    expect(component.isAdmin()).toBe(true);
    expect(component.isFuncionario()).toBe(false);
    expect(component.isCliente()).toBe(false);
    expect(component.podeGerenciarSistema()).toBe(true);
  });

  it('deve fazer logout e navegar para login', () => {
    component.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
