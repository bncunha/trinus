import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(RegisterPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
