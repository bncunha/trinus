import { TestBed } from '@angular/core/testing';
import { OperatorWorkPageComponent } from './operator-work-page.component';

describe('OperatorWorkPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorWorkPageComponent]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(OperatorWorkPageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
