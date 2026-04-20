import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
