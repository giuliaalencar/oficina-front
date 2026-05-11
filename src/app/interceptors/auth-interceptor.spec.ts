import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  afterEach(() => localStorage.clear());

  it('deve adicionar Authorization quando existir token', () => {
    localStorage.setItem('token', 'token-123');
    const req = new HttpRequest('GET', '/api/teste');
    let requestEnviada: HttpRequest<unknown> | undefined;

    const next = vi.fn((request: HttpRequest<unknown>) => {
      requestEnviada = request;
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
    });

    TestBed.runInInjectionContext(() => authInterceptor(req, next as any));

    expect(requestEnviada?.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('nao deve alterar request quando nao existir token', () => {
    const req = new HttpRequest('GET', '/api/teste');
    let requestEnviada: HttpRequest<unknown> | undefined;

    const next = vi.fn((request: HttpRequest<unknown>) => {
      requestEnviada = request;
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
    });

    TestBed.runInInjectionContext(() => authInterceptor(req, next as any));

    expect(requestEnviada?.headers.has('Authorization')).toBe(false);
  });
  it('nao deve acessar localStorage fora do navegador', () => {
    localStorage.setItem('token', 'token-123');
    const req = new HttpRequest('GET', '/api/teste');
    let requestEnviada: HttpRequest<unknown> | undefined;

    const next = vi.fn((request: HttpRequest<unknown>) => {
      requestEnviada = request;
      return of(new HttpResponse({ status: 200 }));
    });

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    });

    TestBed.runInInjectionContext(() => authInterceptor(req, next as any));

    expect(requestEnviada?.headers.has('Authorization')).toBe(false);
  });
});

