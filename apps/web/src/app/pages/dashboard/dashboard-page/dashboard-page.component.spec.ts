import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { OrdersService } from '../../../services-api/orders.service';
import { DashboardPageComponent } from './dashboard-page.component';

class OrdersServiceStub {
  readonly orders$ = of([]);
}

describe('DashboardPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent, RouterTestingModule],
      providers: [{ provide: OrdersService, useClass: OrdersServiceStub }]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
