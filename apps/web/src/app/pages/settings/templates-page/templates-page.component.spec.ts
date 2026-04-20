import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TemplatesPageComponent } from './templates-page.component';

describe('TemplatesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatesPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(TemplatesPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
