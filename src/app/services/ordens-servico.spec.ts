import { TestBed } from '@angular/core/testing';

import { OrdensServico } from './ordens-servico';

describe('OrdensServico', () => {
  let service: OrdensServico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdensServico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
