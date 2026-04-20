import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StagesPageComponent } from './stages-page.component';

describe('StagesPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StagesPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(StagesPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
