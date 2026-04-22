import { TestBed } from '@angular/core/testing';

import { Veiculos } from './veiculos';

describe('Veiculos', () => {
  let service: Veiculos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Veiculos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
