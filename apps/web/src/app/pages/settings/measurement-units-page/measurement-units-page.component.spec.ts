import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MeasurementUnitsPageComponent } from './measurement-units-page.component';

describe('MeasurementUnitsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementUnitsPageComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(MeasurementUnitsPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
