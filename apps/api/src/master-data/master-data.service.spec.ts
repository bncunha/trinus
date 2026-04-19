import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { MasterDataService } from './master-data.service';

describe('MasterDataService', () => {
  const companyId = 'company_1';
  const now = new Date('2026-04-18T12:00:00.000Z');

  const measurementUnitRecord = {
    id: 'unit_1',
    companyId,
    name: 'Metro',
    code: 'm',
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  const variableRecord = {
    id: 'variable_1',
    companyId,
    name: 'Estampas',
    description: 'Quantidade de estampas por peça',
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  const sectorRecord = {
    id: 'sector_1',
    companyId,
    name: 'Corte',
    description: 'Preparação de cortes',
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  const stageRecord = {
    id: 'stage_1',
    companyId,
    sectorId: 'sector_1',
    measurementUnitId: 'unit_1',
    variableId: 'variable_1',
    name: 'Cortar',
    description: 'Corte inicial',
    capacityPerWorkday: 120,
    position: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  const templateRecord = {
    id: 'template_1',
    companyId,
    name: 'Produção de camisa',
    description: 'Fluxo principal',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    items: [
      {
        id: 'item_1',
        templateId: 'template_1',
        stageId: 'stage_1',
        position: 0
      }
    ]
  };

  const prisma = {
    measurementUnit: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    variable: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    sector: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    stage: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    template: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn()
    },
    templateItem: {
      createMany: jest.fn(),
      deleteMany: jest.fn()
    },
    $transaction: jest.fn()
  };

  const service = new MasterDataService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a measurement unit with trimmed name and normalized code', async () => {
    prisma.measurementUnit.create.mockResolvedValue(measurementUnitRecord);

    await expect(
      service.createMeasurementUnit(companyId, {
        name: ' Metro ',
        code: ' M '
      })
    ).resolves.toEqual({
      id: 'unit_1',
      name: 'Metro',
      code: 'm',
      isActive: true
    });
  });

  it('creates a numeric variable without formulas', async () => {
    prisma.variable.create.mockResolvedValue(variableRecord);

    await expect(
      service.createVariable(companyId, {
        name: ' Estampas ',
        description: ' Quantidade de estampas por peça '
      })
    ).resolves.toEqual({
      id: 'variable_1',
      name: 'Estampas',
      description: 'Quantidade de estampas por peça',
      isActive: true
    });
  });

  it('rejects a stage when the sector is outside the company', async () => {
    prisma.sector.findFirst.mockResolvedValue(null);

    await expect(
      service.createStage(companyId, {
        name: 'Cortar',
        sectorId: 'sector_2',
        measurementUnitId: 'unit_1',
        capacityPerWorkday: 120
      })
    ).rejects.toThrow('Setor informado não existe.');
    expect(prisma.stage.create).not.toHaveBeenCalled();
  });

  it('rejects invalid stage capacity', async () => {
    await expect(
      service.createStage(companyId, {
        name: 'Cortar',
        sectorId: 'sector_1',
        measurementUnitId: 'unit_1',
        capacityPerWorkday: 0
      })
    ).rejects.toThrow(BadRequestException);
    expect(prisma.stage.create).not.toHaveBeenCalled();
  });

  it('creates a stage with capacity, unit and optional variable from the same company', async () => {
    prisma.sector.findFirst.mockResolvedValue(sectorRecord);
    prisma.measurementUnit.findFirst.mockResolvedValue(measurementUnitRecord);
    prisma.variable.findFirst.mockResolvedValue(variableRecord);
    prisma.stage.create.mockResolvedValue(stageRecord);

    await expect(
      service.createStage(companyId, {
        name: ' Cortar ',
        description: ' Corte inicial ',
        sectorId: 'sector_1',
        measurementUnitId: 'unit_1',
        variableId: 'variable_1',
        capacityPerWorkday: 120
      })
    ).resolves.toEqual({
      id: 'stage_1',
      name: 'Cortar',
      description: 'Corte inicial',
      sectorId: 'sector_1',
      measurementUnitId: 'unit_1',
      variableId: 'variable_1',
      capacityPerWorkday: 120,
      position: 0,
      isActive: true
    });
  });

  it('creates a sector with defaults', async () => {
    prisma.sector.create.mockResolvedValue(sectorRecord);

    await expect(service.createSector(companyId, { name: ' Corte ', description: ' Preparação de cortes ' })).resolves.toEqual({
      id: 'sector_1',
      name: 'Corte',
      description: 'Preparação de cortes',
      isActive: true
    });
  });

  it('creates a template after confirming all stages belong to the company', async () => {
    prisma.stage.findMany.mockResolvedValue([{ id: 'stage_1' }]);
    prisma.template.create.mockResolvedValue(templateRecord);

    await expect(
      service.createTemplate(companyId, {
        name: ' Produção de camisa ',
        description: ' Fluxo principal ',
        items: [{ stageId: 'stage_1' }]
      })
    ).resolves.toEqual({
      id: 'template_1',
      name: 'Produção de camisa',
      description: 'Fluxo principal',
      isActive: true,
      items: [
        {
          id: 'item_1',
          stageId: 'stage_1',
          position: 0
        }
      ]
    });
  });

  it('allows repeated stages in a template', async () => {
    prisma.stage.findMany.mockResolvedValue([{ id: 'stage_1' }]);
    prisma.template.create.mockResolvedValue({
      ...templateRecord,
      items: [
        { id: 'item_1', templateId: 'template_1', stageId: 'stage_1', position: 0 },
        { id: 'item_2', templateId: 'template_1', stageId: 'stage_1', position: 1 }
      ]
    });

    await expect(
      service.createTemplate(companyId, {
        name: 'Produção com revisão',
        items: [
          { stageId: 'stage_1', position: 0 },
          { stageId: 'stage_1', position: 1 }
        ]
      })
    ).resolves.toMatchObject({
      items: [{ stageId: 'stage_1' }, { stageId: 'stage_1' }]
    });
  });

  it('updates a template and replaces its items in a transaction', async () => {
    prisma.template.findFirst.mockResolvedValue(templateRecord);
    prisma.stage.findMany.mockResolvedValue([{ id: 'stage_1' }]);
    prisma.$transaction.mockImplementation(async (callback: (transaction: unknown) => Promise<unknown>) =>
      callback({
        template: {
          update: jest.fn().mockResolvedValue(templateRecord),
          findUnique: jest.fn().mockResolvedValue(templateRecord)
        },
        templateItem: {
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          createMany: jest.fn().mockResolvedValue({ count: 1 })
        }
      } as never)
    );

    await expect(
      service.updateTemplate(companyId, 'template_1', {
        name: 'Fluxo atualizado',
        items: [{ stageId: 'stage_1' }]
      })
    ).resolves.toMatchObject({
      id: 'template_1',
      items: [{ stageId: 'stage_1' }]
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
