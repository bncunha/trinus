import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SectorsPageComponent } from './sectors-page.component';

describe('SectorsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorsPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SectorsPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
