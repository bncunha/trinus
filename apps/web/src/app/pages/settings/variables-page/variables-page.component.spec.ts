import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { VariablesPageComponent } from './variables-page.component';

describe('VariablesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VariablesPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(VariablesPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
