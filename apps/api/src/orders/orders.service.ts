import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  CreateOrderInput,
  CreateOrderItemInput,
  CreateOrderItemStageInput,
  CreateOrderItemSizeInput,
  Order,
  OrderItem,
  OrderQuantityMode,
  UpdateOrderInput
} from '@trinus/contracts';
import { PrismaService } from '../prisma/prisma.service';

type OrderRecordWithRelations = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    items: {
      include: {
        product: true;
        template: true;
        sizes: { include: { size: true } };
        stages: { include: { stage: true } };
      };
    };
  };
}>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      include: this.orderInclude(),
      orderBy: [{ deliveryDate: 'asc' }, { createdAt: 'desc' }],
      where: { companyId }
    });

    return records.map((record) => this.toOrder(record));
  }

  async findById(companyId: string, id: string): Promise<Order | null> {
    const record = await this.prisma.order.findFirst({
      include: this.orderInclude(),
      where: { companyId, id }
    });

    return record ? this.toOrder(record) : null;
  }

  async create(companyId: string, input: CreateOrderInput): Promise<Order> {
    this.validateOrderInput(input);
    await this.validateCustomer(companyId, input.customerId);
    await this.validateItems(companyId, input.items);

    const record = await this.catchUniqueConflict(() =>
      this.prisma.$transaction(async (transaction) => {
        const order = await transaction.order.create({
          data: {
            companyId,
            customerId: input.customerId.trim(),
            orderNumber: input.orderNumber.trim(),
            status: input.status ?? 'REGISTERED',
            startDate: this.optionalDate(input.startDate),
            deliveryDate: this.optionalDate(input.deliveryDate),
            finalNotes: this.optionalTrim(input.finalNotes)
          }
        });

        for (const [index, item] of input.items.entries()) {
          await this.createItem(transaction, order.id, companyId, item, index);
        }

        return this.findOrderInTransaction(transaction, companyId, order.id);
      })
    );

    return this.toOrder(record);
  }

  async update(companyId: string, id: string, input: UpdateOrderInput): Promise<Order | null> {
    const current = await this.prisma.order.findFirst({ where: { companyId, id } });

    if (!current) {
      return null;
    }

    if (input.orderNumber !== undefined && !input.orderNumber.trim()) {
      throw new BadRequestException('Código do pedido é obrigatório.');
    }

    if (input.customerId !== undefined) {
      await this.validateCustomer(companyId, input.customerId);
    }

    if (input.items !== undefined) {
      if (input.items.length === 0) {
        throw new BadRequestException('Pedido deve ter pelo menos um item.');
      }

      await this.validateItems(companyId, input.items);
    }

    const record = await this.catchUniqueConflict(() =>
      this.prisma.$transaction(async (transaction) => {
        await transaction.order.update({
          data: {
            customerId: input.customerId?.trim(),
            orderNumber: input.orderNumber?.trim(),
            status: input.status,
            startDate: input.startDate === undefined ? undefined : this.optionalDate(input.startDate),
            deliveryDate: input.deliveryDate === undefined ? undefined : this.optionalDate(input.deliveryDate),
            finalNotes: input.finalNotes === undefined ? undefined : this.optionalTrim(input.finalNotes)
          },
          where: { id: current.id }
        });

        if (input.items !== undefined) {
          await transaction.orderItem.deleteMany({ where: { orderId: current.id } });

          for (const [index, item] of input.items.entries()) {
            await this.createItem(transaction, current.id, companyId, item, index);
          }
        }

        return this.findOrderInTransaction(transaction, companyId, current.id);
      })
    );

    return this.toOrder(record);
  }

  private orderInclude() {
    return {
      customer: true,
      items: {
        include: {
          product: true,
          template: true,
          sizes: { include: { size: true }, orderBy: [{ id: 'asc' as const }] },
          stages: { include: { stage: true }, orderBy: [{ position: 'asc' as const }] }
        },
        orderBy: [{ position: 'asc' as const }]
      }
    };
  }

  private async findOrderInTransaction(
    transaction: Prisma.TransactionClient,
    companyId: string,
    id: string
  ): Promise<OrderRecordWithRelations> {
    const record = await transaction.order.findFirst({
      include: this.orderInclude(),
      where: { companyId, id }
    });

    if (!record) {
      throw new BadRequestException('Pedido não encontrado.');
    }

    return record;
  }

  private async createItem(
    transaction: Prisma.TransactionClient,
    orderId: string,
    companyId: string,
    item: CreateOrderItemInput,
    index: number
  ): Promise<void> {
    const stages = await this.resolveItemStages(companyId, item);
    const record = await transaction.orderItem.create({
      data: {
        orderId,
        productId: item.productId.trim(),
        templateId: this.optionalId(item.templateId),
        position: item.position ?? index,
        quantityMode: item.quantityMode,
        quantity: item.quantityMode === 'SINGLE' ? item.quantity : null,
        notes: this.optionalTrim(item.notes)
      }
    });

    if (item.quantityMode === 'SIZE_GRID') {
      await transaction.orderItemSize.createMany({
        data: (item.sizes ?? []).map((size) => ({
          orderItemId: record.id,
          sizeId: size.sizeId.trim(),
          quantity: size.quantity
        }))
      });
    }

    if (stages.length > 0) {
      await transaction.orderItemStage.createMany({
        data: stages.map((stage, stageIndex) => ({
          orderItemId: record.id,
          stageId: stage.stageId.trim(),
          position: stage.position ?? stageIndex
        }))
      });
    }
  }

  private async resolveItemStages(companyId: string, item: CreateOrderItemInput): Promise<CreateOrderItemStageInput[]> {
    if (item.stages !== undefined) {
      return item.stages;
    }

    if (!item.templateId?.trim()) {
      return [];
    }

    const template = await this.prisma.template.findFirst({
      include: { items: { orderBy: [{ position: 'asc' }] } },
      where: { companyId, id: item.templateId.trim(), isActive: true }
    });

    if (!template) {
      throw new BadRequestException('Template de produção informado não existe ou está inativo.');
    }

    return template.items.map((templateItem) => ({
      stageId: templateItem.stageId,
      position: templateItem.position
    }));
  }

  private validateOrderInput(input: CreateOrderInput): void {
    if (!input.orderNumber?.trim()) {
      throw new BadRequestException('Código do pedido é obrigatório.');
    }

    if (!input.customerId?.trim()) {
      throw new BadRequestException('Cliente é obrigatório.');
    }

    if (!input.items || input.items.length === 0) {
      throw new BadRequestException('Pedido deve ter pelo menos um item.');
    }
  }

  private async validateCustomer(companyId: string, customerId: string): Promise<void> {
    if (!customerId?.trim()) {
      throw new BadRequestException('Cliente é obrigatório.');
    }

    const customer = await this.prisma.customer.findFirst({
      where: { companyId, id: customerId.trim(), isActive: true }
    });

    if (!customer) {
      throw new BadRequestException('Cliente informado não existe ou está inativo.');
    }
  }

  private async validateItems(companyId: string, items: CreateOrderItemInput[]): Promise<void> {
    for (const item of items) {
      await this.validateItem(companyId, item);
    }
  }

  private async validateItem(companyId: string, item: CreateOrderItemInput): Promise<void> {
    if (!item.productId?.trim()) {
      throw new BadRequestException('Produto do item é obrigatório.');
    }

    const product = await this.prisma.product.findFirst({
      where: { companyId, id: item.productId.trim(), isActive: true }
    });

    if (!product) {
      throw new BadRequestException('Produto informado não existe ou está inativo.');
    }

    this.validateQuantityMode(item.quantityMode);

    if (item.quantityMode === 'SINGLE') {
      this.validateQuantity(item.quantity, 'Quantidade do item deve ser maior que zero e aceitar até 2 casas decimais.');
    }

    if (item.quantityMode === 'SIZE_GRID') {
      await this.validateSizeGrid(companyId, item.sizes ?? []);
    }

    if (item.templateId?.trim()) {
      const template = await this.prisma.template.findFirst({
        where: { companyId, id: item.templateId.trim(), isActive: true }
      });

      if (!template) {
        throw new BadRequestException('Template de produção informado não existe ou está inativo.');
      }
    }

    if (item.stages !== undefined) {
      await this.validateStages(companyId, item.stages);
    }
  }

  private validateQuantityMode(quantityMode: OrderQuantityMode): void {
    if (quantityMode !== 'SINGLE' && quantityMode !== 'SIZE_GRID') {
      throw new BadRequestException('Modo de quantidade inválido.');
    }
  }

  private async validateSizeGrid(companyId: string, sizes: CreateOrderItemSizeInput[]): Promise<void> {
    if (sizes.length === 0) {
      throw new BadRequestException('Grade de tamanhos deve ter pelo menos uma quantidade.');
    }

    const sizeIds = sizes.map((size) => size.sizeId?.trim());

    if (sizeIds.some((sizeId) => !sizeId)) {
      throw new BadRequestException('Tamanho da grade é obrigatório.');
    }

    if (new Set(sizeIds).size !== sizeIds.length) {
      throw new BadRequestException('Tamanho não pode repetir no mesmo item.');
    }

    for (const size of sizes) {
      this.validateQuantity(size.quantity, 'Quantidade por tamanho deve ser maior que zero e aceitar até 2 casas decimais.');
    }

    const records = await this.prisma.clothingSize.findMany({
      select: { id: true },
      where: { companyId, id: { in: sizeIds }, isActive: true }
    });

    if (records.length !== sizeIds.length) {
      throw new BadRequestException('Um ou mais tamanhos informados não existem ou estão inativos.');
    }
  }

  private async validateStages(companyId: string, stages: CreateOrderItemStageInput[]): Promise<void> {
    const stageIds = stages.map((stage) => stage.stageId?.trim());

    if (stageIds.some((stageId) => !stageId)) {
      throw new BadRequestException('Etapa do item é obrigatória.');
    }

    const uniqueStageIds = [...new Set(stageIds)];
    const records = await this.prisma.stage.findMany({
      select: { id: true },
      where: { companyId, id: { in: uniqueStageIds }, isActive: true }
    });

    if (records.length !== uniqueStageIds.length) {
      throw new BadRequestException('Uma ou mais etapas informadas não existem ou estão inativas.');
    }
  }

  private validateQuantity(quantity: number | undefined, message: string): void {
    if (!Number.isFinite(quantity) || Number(quantity) <= 0) {
      throw new BadRequestException(message);
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(quantity))) {
      throw new BadRequestException(message);
    }
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

  private optionalDate(value: string | undefined): Date | null {
    if (!value?.trim()) {
      return null;
    }

    return new Date(`${value}T00:00:00`);
  }

  private dateToString(value: Date | null): string {
    return value ? value.toISOString().slice(0, 10) : '';
  }

  private async catchUniqueConflict<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe um pedido com este código.');
      }

      throw error;
    }
  }

  private toOrder(record: OrderRecordWithRelations): Order {
    const items = record.items.map((item) => this.toOrderItem(item));

    return {
      id: record.id,
      orderNumber: record.orderNumber,
      customerId: record.customerId,
      customerName: record.customer.name,
      status: record.status,
      startDate: this.dateToString(record.startDate),
      deliveryDate: this.dateToString(record.deliveryDate),
      riskLevel: 'LOW',
      riskReason: 'Pedido aguardando cálculo de risco.',
      nextStep: this.getNextStep(items),
      finalNotes: record.finalNotes ?? undefined,
      items,
      products: items.map((item) => ({
        name: item.productName,
        quantity: item.totalQuantity
      }))
    };
  }

  private toOrderItem(item: OrderRecordWithRelations['items'][number]): OrderItem {
    const sizes = item.sizes
      .map((size) => ({
        id: size.id,
        sizeId: size.sizeId,
        sizeName: size.size.name,
        position: size.size.position,
        quantity: Number(size.quantity)
      }))
      .sort((left, right) => left.position - right.position || left.sizeName.localeCompare(right.sizeName))
      .map(({ position: _position, ...size }) => size);
    const stages = item.stages.map((stage) => ({
      id: stage.id,
      stageId: stage.stageId,
      stageName: stage.stage.name,
      position: stage.position
    }));
    const quantity = item.quantity === null ? undefined : Number(item.quantity);
    const totalQuantity = item.quantityMode === 'SINGLE'
      ? quantity ?? 0
      : sizes.reduce((sum, size) => sum + size.quantity, 0);

    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      templateId: item.templateId ?? undefined,
      templateName: item.template?.name,
      position: item.position,
      quantityMode: item.quantityMode,
      quantity,
      sizes,
      stages,
      totalQuantity,
      notes: item.notes ?? undefined
    };
  }

  private getNextStep(items: OrderItem[]): string {
    const firstStage = items.flatMap((item) => item.stages).sort((left, right) => left.position - right.position)[0];

    return firstStage ? `Iniciar etapa ${firstStage.stageName}.` : 'Definir etapas de produção.';
  }
}
