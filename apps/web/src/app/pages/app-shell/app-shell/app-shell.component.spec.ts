import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../services-api/auth.service';
import { OrdersService } from '../../../services-api/orders.service';
import { AppShellComponent } from './app-shell.component';

class AuthServiceStub {
  readonly session$ = of(null);
  logout = jest.fn(() => of(undefined));
}

class OrdersServiceStub {
  loadOrders = jest.fn(() => of([]));
  resetOrders = jest.fn();
}

describe('AppShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: OrdersService, useClass: OrdersServiceStub }
      ]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(AppShellComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
