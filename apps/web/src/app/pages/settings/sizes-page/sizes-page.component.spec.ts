import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SizesPageComponent } from './sizes-page.component';

describe('SizesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizesPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SizesPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
