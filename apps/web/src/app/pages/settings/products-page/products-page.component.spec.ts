import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductsPageComponent } from './products-page.component';

describe('ProductsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(ProductsPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
