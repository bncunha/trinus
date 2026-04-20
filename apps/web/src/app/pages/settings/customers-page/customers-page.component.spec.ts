import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomersPageComponent } from './customers-page.component';

describe('CustomersPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
