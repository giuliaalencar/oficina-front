import { of } from 'rxjs';
import { DashboardHomeComponent } from './dashboard-home';

describe('DashboardHomeComponent', () => {
  it('deve carregar totais do dashboard', () => {
    const http = {
      get: vi.fn()
        .mockReturnValueOnce(of([{}, {}]))
        .mockReturnValueOnce(of([{}]))
        .mockReturnValueOnce(of([{}, {}, {}]))
        .mockReturnValueOnce(of([]))
    };
    const component = new DashboardHomeComponent(http as any);

    component.ngOnInit();

    expect(component.totalClientes).toBe(2);
    expect(component.totalVeiculos).toBe(1);
    expect(component.totalItens).toBe(3);
    expect(component.totalOrdens).toBe(0);
  });
});
