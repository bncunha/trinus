import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MasterDataService } from '../../../services-api/master-data.service';
import { SettingsPageComponent } from './settings-page.component';

class MasterDataServiceStub {
  listMeasurementUnits = jest.fn(() => of([]));
  listVariables = jest.fn(() => of([]));
  listSizes = jest.fn(() => of([]));
  listSectors = jest.fn(() => of([]));
  listStages = jest.fn(() => of([]));
  listTemplates = jest.fn(() => of([]));
}

describe('SettingsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: MasterDataService, useClass: MasterDataServiceStub }]
    }).compileComponents();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
