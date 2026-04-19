import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MasterDataService } from './master-data.service';

describe('MasterDataService', () => {
  const httpMock = {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [MasterDataService, { provide: HttpClient, useValue: httpMock }]
    });
  });

  it('lista unidades de medida com cookies habilitados', (done) => {
    httpMock.get.mockReturnValue(of([]));
    const service = TestBed.inject(MasterDataService);

    service.listMeasurementUnits().subscribe(() => {
      expect(httpMock.get).toHaveBeenCalledWith('http://localhost:3000/master-data/measurement-units', {
        withCredentials: true
      });
      done();
    });
  });

  it('cria etapa com capacidade e vínculos produtivos', (done) => {
    const request = {
      name: 'Cortar',
      sectorId: 'sector_1',
      measurementUnitId: 'unit_1',
      variableId: 'variable_1',
      capacityPerWorkday: 120
    };
    httpMock.post.mockReturnValue(of({ id: 'stage_1', ...request, position: 0, isActive: true }));
    const service = TestBed.inject(MasterDataService);

    service.createStage(request).subscribe(() => {
      expect(httpMock.post).toHaveBeenCalledWith('http://localhost:3000/master-data/stages', request, {
        withCredentials: true
      });
      done();
    });
  });

  it('atualiza template de produção com etapas ordenadas', (done) => {
    const request = {
      name: 'Camisa DTF',
      items: [
        { stageId: 'stage_1', position: 0 },
        { stageId: 'stage_2', position: 1 }
      ]
    };
    httpMock.patch.mockReturnValue(of({ id: 'template_1', ...request, isActive: true }));
    const service = TestBed.inject(MasterDataService);

    service.updateTemplate('template_1', request).subscribe(() => {
      expect(httpMock.patch).toHaveBeenCalledWith('http://localhost:3000/master-data/templates/template_1', request, {
        withCredentials: true
      });
      done();
    });
  });

  it('inativa variáveis pelo endpoint de delete lógico', (done) => {
    httpMock.delete.mockReturnValue(of({ id: 'variable_1', name: 'Estampas', isActive: false }));
    const service = TestBed.inject(MasterDataService);

    service.deleteVariable('variable_1').subscribe(() => {
      expect(httpMock.delete).toHaveBeenCalledWith('http://localhost:3000/master-data/variables/variable_1', {
        withCredentials: true
      });
      done();
    });
  });
});
