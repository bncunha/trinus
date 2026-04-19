import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import {
  Prisma,
  type MeasurementUnit as MeasurementUnitRecord,
  type Sector as SectorRecord,
  type Stage as StageRecord,
  type Template as TemplateRecord,
  type TemplateItem as TemplateItemRecord,
  type Variable as VariableRecord
} from '@prisma/client';
import type {
  CreateMeasurementUnitInput,
  CreateSectorInput,
  CreateStageInput,
  CreateTemplateInput,
  CreateTemplateItemInput,
  CreateVariableInput,
  MeasurementUnit,
  Sector,
  Stage,
  Template,
  TemplateItem,
  UpdateMeasurementUnitInput,
  UpdateSectorInput,
  UpdateStageInput,
  UpdateTemplateInput,
  UpdateVariableInput,
  Variable
} from '@trinus/contracts';
import { PrismaService } from '../prisma/prisma.service';

type TemplateRecordWithItems = TemplateRecord & {
  items: TemplateItemRecord[];
};

@Injectable()
export class MasterDataService {
  constructor(private readonly prisma: PrismaService) {}

  async listMeasurementUnits(companyId: string): Promise<MeasurementUnit[]> {
    const records = await this.prisma.measurementUnit.findMany({
      orderBy: [{ name: 'asc' }],
      where: { companyId }
    });

    return records.map((record) => this.toMeasurementUnit(record));
  }

  async findMeasurementUnit(companyId: string, id: string): Promise<MeasurementUnit | null> {
    const record = await this.prisma.measurementUnit.findFirst({ where: { companyId, id } });
    return record ? this.toMeasurementUnit(record) : null;
  }

  async createMeasurementUnit(companyId: string, input: CreateMeasurementUnitInput): Promise<MeasurementUnit> {
    this.validateName(input.name);
    this.validateCode(input.code);

    const record = await this.catchUniqueConflict(() =>
      this.prisma.measurementUnit.create({
        data: {
          companyId,
          name: input.name.trim(),
          code: this.normalizeCode(input.code),
          isActive: input.isActive ?? true
        }
      })
    );

    return this.toMeasurementUnit(record);
  }

  async updateMeasurementUnit(
    companyId: string,
    id: string,
    input: UpdateMeasurementUnitInput
  ): Promise<MeasurementUnit | null> {
    const current = await this.prisma.measurementUnit.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    if (input.code !== undefined) {
      this.validateCode(input.code);
    }

    const record = await this.catchUniqueConflict(() =>
      this.prisma.measurementUnit.update({
        data: {
          name: input.name?.trim(),
          code: input.code === undefined ? undefined : this.normalizeCode(input.code),
          isActive: input.isActive
        },
        where: { id: current.id }
      })
    );

    return this.toMeasurementUnit(record);
  }

  async deleteMeasurementUnit(companyId: string, id: string): Promise<MeasurementUnit | null> {
    return this.deactivateRecord(companyId, id, this.prisma.measurementUnit, this.toMeasurementUnit);
  }

  async listVariables(companyId: string): Promise<Variable[]> {
    const records = await this.prisma.variable.findMany({
      orderBy: [{ name: 'asc' }],
      where: { companyId }
    });

    return records.map((record) => this.toVariable(record));
  }

  async findVariable(companyId: string, id: string): Promise<Variable | null> {
    const record = await this.prisma.variable.findFirst({ where: { companyId, id } });
    return record ? this.toVariable(record) : null;
  }

  async createVariable(companyId: string, input: CreateVariableInput): Promise<Variable> {
    this.validateName(input.name);

    const record = await this.catchUniqueConflict(() =>
      this.prisma.variable.create({
        data: {
          companyId,
          name: input.name.trim(),
          description: this.optionalTrim(input.description),
          isActive: input.isActive ?? true
        }
      })
    );

    return this.toVariable(record);
  }

  async updateVariable(companyId: string, id: string, input: UpdateVariableInput): Promise<Variable | null> {
    const current = await this.prisma.variable.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    const record = await this.catchUniqueConflict(() =>
      this.prisma.variable.update({
        data: {
          name: input.name?.trim(),
          description: input.description === undefined ? undefined : this.optionalTrim(input.description),
          isActive: input.isActive
        },
        where: { id: current.id }
      })
    );

    return this.toVariable(record);
  }

  async deleteVariable(companyId: string, id: string): Promise<Variable | null> {
    return this.deactivateRecord(companyId, id, this.prisma.variable, this.toVariable);
  }

  async listSectors(companyId: string): Promise<Sector[]> {
    const records = await this.prisma.sector.findMany({
      orderBy: [{ name: 'asc' }],
      where: { companyId }
    });

    return records.map((record) => this.toSector(record));
  }

  async findSector(companyId: string, id: string): Promise<Sector | null> {
    const record = await this.prisma.sector.findFirst({ where: { companyId, id } });
    return record ? this.toSector(record) : null;
  }

  async createSector(companyId: string, input: CreateSectorInput): Promise<Sector> {
    this.validateName(input.name);

    const record = await this.catchUniqueConflict(() =>
      this.prisma.sector.create({
        data: {
          companyId,
          name: input.name.trim(),
          description: this.optionalTrim(input.description),
          isActive: input.isActive ?? true
        }
      })
    );

    return this.toSector(record);
  }

  async updateSector(companyId: string, id: string, input: UpdateSectorInput): Promise<Sector | null> {
    const current = await this.prisma.sector.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    const record = await this.catchUniqueConflict(() =>
      this.prisma.sector.update({
        data: {
          name: input.name?.trim(),
          description: input.description === undefined ? undefined : this.optionalTrim(input.description),
          isActive: input.isActive
        },
        where: { id: current.id }
      })
    );

    return this.toSector(record);
  }

  async deleteSector(companyId: string, id: string): Promise<Sector | null> {
    return this.deactivateRecord(companyId, id, this.prisma.sector, this.toSector);
  }

  async listStages(companyId: string): Promise<Stage[]> {
    const records = await this.prisma.stage.findMany({
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      where: { companyId }
    });

    return records.map((record) => this.toStage(record));
  }

  async findStage(companyId: string, id: string): Promise<Stage | null> {
    const record = await this.prisma.stage.findFirst({ where: { companyId, id } });
    return record ? this.toStage(record) : null;
  }

  async createStage(companyId: string, input: CreateStageInput): Promise<Stage> {
    this.validateStageInput(input);
    await this.ensureSector(companyId, input.sectorId);
    await this.ensureMeasurementUnit(companyId, input.measurementUnitId);
    await this.ensureVariable(companyId, input.variableId);

    const record = await this.catchUniqueConflict(() =>
      this.prisma.stage.create({
        data: {
          companyId,
          sectorId: input.sectorId.trim(),
          measurementUnitId: input.measurementUnitId.trim(),
          variableId: this.optionalId(input.variableId),
          name: input.name.trim(),
          description: this.optionalTrim(input.description),
          capacityPerWorkday: input.capacityPerWorkday,
          position: input.position ?? 0,
          isActive: input.isActive ?? true
        }
      })
    );

    return this.toStage(record);
  }

  async updateStage(companyId: string, id: string, input: UpdateStageInput): Promise<Stage | null> {
    const current = await this.prisma.stage.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    this.validateStageUpdateInput(input);
    await this.ensureSector(companyId, input.sectorId);
    await this.ensureMeasurementUnit(companyId, input.measurementUnitId);
    await this.ensureVariable(companyId, input.variableId);

    const data: Prisma.StageUpdateInput = {
      name: input.name?.trim(),
      description: input.description === undefined ? undefined : this.optionalTrim(input.description),
      capacityPerWorkday: input.capacityPerWorkday,
      position: input.position,
      isActive: input.isActive
    };

    if (input.sectorId !== undefined) {
      data.sector = { connect: { id: input.sectorId } };
    }

    if (input.measurementUnitId !== undefined) {
      data.measurementUnit = { connect: { id: input.measurementUnitId } };
    }

    if (input.variableId !== undefined) {
      data.variable = input.variableId ? { connect: { id: input.variableId } } : { disconnect: true };
    }

    const record = await this.catchUniqueConflict(() =>
      this.prisma.stage.update({
        data,
        where: { id: current.id }
      })
    );

    return this.toStage(record);
  }

  async deleteStage(companyId: string, id: string): Promise<Stage | null> {
    return this.deactivateRecord(companyId, id, this.prisma.stage, this.toStage);
  }

  async listTemplates(companyId: string): Promise<Template[]> {
    const records = await this.prisma.template.findMany({
      include: { items: { orderBy: [{ position: 'asc' }] } },
      orderBy: [{ name: 'asc' }],
      where: { companyId }
    });

    return records.map((record) => this.toTemplate(record));
  }

  async findTemplate(companyId: string, id: string): Promise<Template | null> {
    const record = await this.prisma.template.findFirst({
      include: { items: { orderBy: [{ position: 'asc' }] } },
      where: { companyId, id }
    });

    return record ? this.toTemplate(record) : null;
  }

  async createTemplate(companyId: string, input: CreateTemplateInput): Promise<Template> {
    this.validateName(input.name);
    await this.validateTemplateItems(companyId, input.items ?? []);

    const record = await this.catchUniqueConflict(() =>
      this.prisma.template.create({
        data: {
          companyId,
          name: input.name.trim(),
          description: this.optionalTrim(input.description),
          isActive: input.isActive ?? true,
          items: {
            create: this.toTemplateItemNestedCreateData(input.items ?? [])
          }
        },
        include: { items: { orderBy: [{ position: 'asc' }] } }
      })
    );

    return this.toTemplate(record);
  }

  async updateTemplate(companyId: string, id: string, input: UpdateTemplateInput): Promise<Template | null> {
    const current = await this.prisma.template.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    if (input.items !== undefined) {
      await this.validateTemplateItems(companyId, input.items);
    }

    const record = await this.catchUniqueConflict(() =>
      this.prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
        await transaction.template.update({
          data: {
            name: input.name?.trim(),
            description: input.description === undefined ? undefined : this.optionalTrim(input.description),
            isActive: input.isActive
          },
          where: { id: current.id }
        });

        if (input.items !== undefined) {
          await transaction.templateItem.deleteMany({ where: { templateId: current.id } });

          if (input.items.length > 0) {
            await transaction.templateItem.createMany({
              data: this.toTemplateItemCreateManyData(current.id, input.items)
            });
          }
        }

        const updated = await transaction.template.findUnique({
          include: { items: { orderBy: [{ position: 'asc' }] } },
          where: { id: current.id }
        });

        if (!updated) {
          throw new BadRequestException('Template não encontrado.');
        }

        return updated;
      })
    );

    return this.toTemplate(record);
  }

  async deleteTemplate(companyId: string, id: string): Promise<Template | null> {
    const current = await this.prisma.template.findFirst({
      include: { items: { orderBy: [{ position: 'asc' }] } },
      where: { companyId, id }
    });

    if (!current) {
      return null;
    }

    const record = await this.prisma.template.update({
      data: { isActive: false },
      include: { items: { orderBy: [{ position: 'asc' }] } },
      where: { id: current.id }
    });

    return this.toTemplate(record);
  }

  private validateStageInput(input: CreateStageInput): void {
    this.validateName(input.name);
    this.validateRequiredId(input.sectorId, 'Setor é obrigatório.');
    this.validateRequiredId(input.measurementUnitId, 'Unidade de medida é obrigatória.');
    this.validateCapacity(input.capacityPerWorkday);
    this.validatePosition(input.position);
  }

  private validateStageUpdateInput(input: UpdateStageInput): void {
    if (input.name !== undefined) {
      this.validateName(input.name);
    }

    if (input.sectorId !== undefined) {
      this.validateRequiredId(input.sectorId, 'Setor é obrigatório.');
    }

    if (input.measurementUnitId !== undefined) {
      this.validateRequiredId(input.measurementUnitId, 'Unidade de medida é obrigatória.');
    }

    if (input.capacityPerWorkday !== undefined) {
      this.validateCapacity(input.capacityPerWorkday);
    }

    if (input.position !== undefined) {
      this.validatePosition(input.position);
    }
  }

  private async ensureMeasurementUnit(companyId: string, measurementUnitId: string | undefined): Promise<void> {
    if (measurementUnitId === undefined || measurementUnitId === '') {
      return;
    }

    const measurementUnit = await this.prisma.measurementUnit.findFirst({
      where: { companyId, id: measurementUnitId }
    });

    if (!measurementUnit) {
      throw new BadRequestException('Unidade de medida informada não existe.');
    }
  }

  private async ensureSector(companyId: string, sectorId: string | undefined): Promise<void> {
    if (sectorId === undefined || sectorId === '') {
      return;
    }

    const sector = await this.prisma.sector.findFirst({ where: { companyId, id: sectorId } });

    if (!sector) {
      throw new BadRequestException('Setor informado não existe.');
    }
  }

  private async ensureVariable(companyId: string, variableId: string | undefined): Promise<void> {
    if (variableId === undefined || variableId === '') {
      return;
    }

    const variable = await this.prisma.variable.findFirst({ where: { companyId, id: variableId } });

    if (!variable) {
      throw new BadRequestException('Variável informada não existe.');
    }
  }

  private async validateTemplateItems(companyId: string, items: CreateTemplateItemInput[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const stageIds = items.map((item) => item.stageId?.trim());

    if (stageIds.some((stageId) => !stageId?.trim())) {
      throw new BadRequestException('Etapa do template é obrigatória.');
    }

    for (const item of items) {
      this.validatePosition(item.position);
    }

    const uniqueStageIds = [...new Set(stageIds)];
    const stages = await this.prisma.stage.findMany({
      select: { id: true },
      where: {
        companyId,
        id: { in: uniqueStageIds }
      }
    });

    if (stages.length !== uniqueStageIds.length) {
      throw new BadRequestException('Uma ou mais etapas informadas não existem.');
    }
  }

  private validateName(name: string | undefined): void {
    if (!name?.trim()) {
      throw new BadRequestException('Nome é obrigatório.');
    }
  }

  private validateCode(code: string | undefined): void {
    if (!code?.trim()) {
      throw new BadRequestException('Sigla é obrigatória.');
    }
  }

  private validateRequiredId(id: string | undefined, message: string): void {
    if (!id?.trim()) {
      throw new BadRequestException(message);
    }
  }

  private validateCapacity(capacity: number | undefined): void {
    if (!Number.isFinite(capacity) || Number(capacity) <= 0) {
      throw new BadRequestException('Capacidade por dia útil deve ser maior que zero.');
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(capacity))) {
      throw new BadRequestException('Capacidade por dia útil aceita no máximo 2 casas decimais.');
    }
  }

  private validatePosition(position: number | undefined): void {
    if (position === undefined) {
      return;
    }

    if (!Number.isInteger(position) || position < 0) {
      throw new BadRequestException('Posição deve ser um número inteiro maior ou igual a zero.');
    }
  }

  private normalizeCode(code: string): string {
    return code.trim().toLowerCase();
  }

  private optionalTrim(value: string | undefined): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private optionalId(value: string | undefined): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private toTemplateItemNestedCreateData(items: CreateTemplateItemInput[]): Prisma.TemplateItemCreateWithoutTemplateInput[] {
    return items.map((item, index) => ({
      stage: { connect: { id: item.stageId.trim() } },
      position: item.position ?? index
    }));
  }

  private toTemplateItemCreateManyData(templateId: string, items: CreateTemplateItemInput[]): Prisma.TemplateItemCreateManyInput[] {
    return items.map((item, index) => ({
      templateId,
      stageId: item.stageId.trim(),
      position: item.position ?? index
    }));
  }

  private async catchUniqueConflict<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um cadastro com este nome ou sigla.');
      }

      throw error;
    }
  }

  private async deactivateRecord<TRecord extends { id: string; companyId: string; isActive: boolean }, TOutput>(
    companyId: string,
    id: string,
    delegate: {
      findFirst(args: { where: { companyId: string; id: string } }): Promise<TRecord | null>;
      update(args: { data: { isActive: boolean }; where: { id: string } }): Promise<TRecord>;
    },
    mapper: (record: TRecord) => TOutput
  ): Promise<TOutput | null> {
    const current = await delegate.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    const record = await delegate.update({
      data: { isActive: false },
      where: { id: current.id }
    });

    return mapper.call(this, record);
  }

  private toMeasurementUnit(record: MeasurementUnitRecord): MeasurementUnit {
    return {
      id: record.id,
      name: record.name,
      code: record.code,
      isActive: record.isActive
    };
  }

  private toVariable(record: VariableRecord): Variable {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      isActive: record.isActive
    };
  }

  private toSector(record: SectorRecord): Sector {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      isActive: record.isActive
    };
  }

  private toStage(record: StageRecord): Stage {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      sectorId: record.sectorId,
      measurementUnitId: record.measurementUnitId,
      capacityPerWorkday: Number(record.capacityPerWorkday),
      variableId: record.variableId ?? undefined,
      position: record.position,
      isActive: record.isActive
    };
  }

  private toTemplate(record: TemplateRecordWithItems): Template {
    return {
      id: record.id,
      name: record.name,
      description: record.description ?? undefined,
      isActive: record.isActive,
      items: record.items.map((item) => this.toTemplateItem(item))
    };
  }

  private toTemplateItem(record: TemplateItemRecord): TemplateItem {
    return {
      id: record.id,
      stageId: record.stageId,
      position: record.position
    };
  }
}
