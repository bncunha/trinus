import { NotFoundException } from '@nestjs/common';
import type { CreateTemplateInput, MeasurementUnit, Template, Variable } from '@trinus/contracts';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

describe('MasterDataController', () => {
  const request = {
    auth: {
      user: {
        id: 'user_1',
        companyId: 'company_1',
        name: 'Admin',
        email: 'admin@trinus.test',
        role: 'ADMIN',
        isActive: true
      },
      company: {
        id: 'company_1',
        name: 'Trinus Test'
      }
    }
  } as never;

  const measurementUnit: MeasurementUnit = {
    id: 'unit_1',
    name: 'Metro',
    code: 'm',
    isActive: true
  };

  const variable: Variable = {
    id: 'variable_1',
    name: 'Estampas',
    description: 'Quantidade de estampas por peça',
    isActive: true
  };

  const template: Template = {
    id: 'template_1',
    name: 'Ficha camisa',
    description: 'Medidas principais',
    isActive: true,
    items: [
      {
        id: 'item_1',
        stageId: 'stage_1',
        position: 0
      }
    ]
  };

  const service = {
    listMeasurementUnits: jest.fn().mockResolvedValue([measurementUnit]),
    findMeasurementUnit: jest.fn().mockResolvedValue(measurementUnit),
    createMeasurementUnit: jest.fn().mockResolvedValue(measurementUnit),
    updateMeasurementUnit: jest.fn().mockResolvedValue(measurementUnit),
    deleteMeasurementUnit: jest.fn().mockResolvedValue({ ...measurementUnit, isActive: false }),
    listVariables: jest.fn().mockResolvedValue([variable]),
    findVariable: jest.fn().mockResolvedValue(variable),
    createVariable: jest.fn().mockResolvedValue(variable),
    updateVariable: jest.fn().mockResolvedValue(variable),
    deleteVariable: jest.fn().mockResolvedValue({ ...variable, isActive: false }),
    listSectors: jest.fn().mockResolvedValue([]),
    findSector: jest.fn().mockResolvedValue(null),
    createSector: jest.fn(),
    updateSector: jest.fn(),
    deleteSector: jest.fn(),
    listStages: jest.fn().mockResolvedValue([]),
    findStage: jest.fn().mockResolvedValue(null),
    createStage: jest.fn(),
    updateStage: jest.fn(),
    deleteStage: jest.fn(),
    listTemplates: jest.fn().mockResolvedValue([template]),
    findTemplate: jest.fn().mockResolvedValue(template),
    createTemplate: jest.fn().mockResolvedValue(template),
    updateTemplate: jest.fn().mockResolvedValue(template),
    deleteTemplate: jest.fn().mockResolvedValue({ ...template, isActive: false })
  } as unknown as jest.Mocked<MasterDataService>;

  const controller = new MasterDataController(service);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists measurement units using the company from the session', async () => {
    await expect(controller.getMeasurementUnits(request)).resolves.toEqual([measurementUnit]);
    expect(service.listMeasurementUnits).toHaveBeenCalledWith('company_1');
  });

  it('throws NotFoundException when a measurement unit is missing', async () => {
    service.findMeasurementUnit.mockResolvedValueOnce(null);

    await expect(controller.getMeasurementUnit(request, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('lists variables using the company from the session', async () => {
    await expect(controller.getVariables(request)).resolves.toEqual([variable]);
    expect(service.listVariables).toHaveBeenCalledWith('company_1');
  });

  it('creates a template using the company from the session', async () => {
    const input: CreateTemplateInput = {
      name: 'Ficha camisa',
      items: [{ stageId: 'stage_1' }]
    };

    await expect(controller.createTemplate(request, input)).resolves.toEqual(template);
    expect(service.createTemplate).toHaveBeenCalledWith('company_1', input);
  });

  it('throws NotFoundException when a sector is missing', async () => {
    await expect(controller.getSector(request, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('soft deletes templates through the service', async () => {
    await expect(controller.deleteTemplate(request, 'template_1')).resolves.toMatchObject({
      id: 'template_1',
      isActive: false
    });
    expect(service.deleteTemplate).toHaveBeenCalledWith('company_1', 'template_1');
  });
});
