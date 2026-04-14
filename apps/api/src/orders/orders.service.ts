import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CreateOrderInput, Order, UpdateOrderInput } from '@trinus/contracts';
import { OrdersRepository } from './orders.repository';

const DEFAULT_RISK_REASON = 'Order is waiting for an operational review.';
const DEFAULT_NEXT_STEP = 'Confirm order details.';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  findAll(companyId: string): Order[] {
    return this.ordersRepository.findAll(companyId);
  }

  findById(companyId: string, id: string): Order | null {
    return this.ordersRepository.findById(companyId, id);
  }

  create(companyId: string, input: CreateOrderInput): Order {
    this.validateProducts(input.products);

    const startDate = input.startDate ?? new Date().toISOString().slice(0, 10);
    const deliveryDate = input.deliveryDate ?? startDate;

    const order: Order = {
      id: randomUUID(),
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      status: input.status ?? 'REGISTERED',
      startDate,
      deliveryDate,
      riskLevel: input.riskLevel ?? 'LOW',
      riskReason: input.riskReason ?? DEFAULT_RISK_REASON,
      nextStep: input.nextStep ?? DEFAULT_NEXT_STEP,
      finalNotes: input.finalNotes,
      products: input.products.map((product: CreateOrderInput['products'][number]) => ({ ...product }))
    };

    return this.ordersRepository.save(companyId, order);
  }

  update(companyId: string, id: string, input: UpdateOrderInput): Order | null {
    const currentOrder = this.ordersRepository.findById(companyId, id);

    if (currentOrder === null) {
      return null;
    }

    if (input.products !== undefined) {
      this.validateProducts(input.products);
    }

    const order: Order = {
      ...currentOrder,
      ...input,
      id,
      orderNumber: input.orderNumber ?? currentOrder.orderNumber,
      customerName: input.customerName ?? currentOrder.customerName,
      startDate: input.startDate ?? currentOrder.startDate,
      deliveryDate: input.deliveryDate ?? currentOrder.deliveryDate,
      status: input.status ?? currentOrder.status,
      riskLevel: input.riskLevel ?? currentOrder.riskLevel,
      riskReason: input.riskReason ?? currentOrder.riskReason,
      nextStep: input.nextStep ?? currentOrder.nextStep,
      finalNotes: input.finalNotes ?? currentOrder.finalNotes,
      products: (input.products ?? currentOrder.products).map((product) => ({ ...product }))
    };

    return this.ordersRepository.update(companyId, id, order);
  }

  private validateProducts(products: CreateOrderInput['products']): void {
    if (products.length === 0) {
      throw new BadRequestException('Order must have at least one product.');
    }

    for (const product of products) {
      if (!product.name.trim()) {
        throw new BadRequestException('Product name is required.');
      }

      if (!this.isValidQuantity(product.quantity)) {
        throw new BadRequestException('Product quantity must be greater than zero with up to 2 decimal places.');
      }
    }
  }

  private isValidQuantity(quantity: number): boolean {
    return Number.isFinite(quantity) && quantity > 0 && /^\d+(\.\d{1,2})?$/.test(String(quantity));
  }
}
