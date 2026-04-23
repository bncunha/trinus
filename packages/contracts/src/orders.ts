export type OrderStatus = 'REGISTERED' | 'IN_PROGRESS' | 'PAUSED' | 'CANCELED' | 'FINISHED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type OrderQuantityMode = 'SINGLE' | 'SIZE_GRID';

export interface OrderProduct {
  name: string;
  quantity: number;
}

export interface OrderItemSize {
  id: string;
  sizeId: string;
  sizeName: string;
  quantity: number;
}

export interface OrderItemStage {
  id: string;
  stageId: string;
  stageName: string;
  position: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  templateId?: string;
  templateName?: string;
  position: number;
  quantityMode: OrderQuantityMode;
  quantity?: number;
  sizes: OrderItemSize[];
  stages: OrderItemStage[];
  totalQuantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  startDate: string;
  deliveryDate: string;
  riskLevel: RiskLevel;
  riskReason: string;
  nextStep: string;
  finalNotes?: string;
  items: OrderItem[];
  products: OrderProduct[];
}

export interface CreateOrderInput {
  orderNumber: string;
  customerId: string;
  startDate?: string;
  deliveryDate?: string;
  status?: OrderStatus;
  finalNotes?: string;
  items: CreateOrderItemInput[];
}

export type UpdateOrderInput = Partial<CreateOrderInput>;

export interface CreateOrderItemSizeInput {
  sizeId: string;
  quantity: number;
}

export interface CreateOrderItemStageInput {
  stageId: string;
  position?: number;
}

export interface CreateOrderItemInput {
  productId: string;
  templateId?: string;
  position?: number;
  quantityMode: OrderQuantityMode;
  quantity?: number;
  sizes?: CreateOrderItemSizeInput[];
  stages?: CreateOrderItemStageInput[];
  notes?: string;
}
