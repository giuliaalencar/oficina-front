import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdensServicoComponent } from './ordens-servico';

describe('OrdensServicoComponent', () => {
  let component: OrdensServicoComponent;
  let fixture: ComponentFixture<OrdensServicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdensServicoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdensServicoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
