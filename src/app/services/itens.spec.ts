import { TestBed } from '@angular/core/testing';

import { Itens } from './itens';

describe('Itens', () => {
  let service: Itens;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Itens);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
