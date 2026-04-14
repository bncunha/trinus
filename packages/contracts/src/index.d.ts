export type OrderStatus = 'REGISTERED' | 'IN_PROGRESS' | 'PAUSED' | 'CANCELED' | 'FINISHED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export interface OrderProduct {
    name: string;
    quantity: number;
}
export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    status: OrderStatus;
    startDate: string;
    deliveryDate: string;
    riskLevel: RiskLevel;
    riskReason: string;
    nextStep: string;
    products: OrderProduct[];
}
export interface CreateOrderInput {
    orderNumber: string;
    customerName: string;
    startDate?: string;
    deliveryDate?: string;
    status?: OrderStatus;
    riskLevel?: RiskLevel;
    riskReason?: string;
    nextStep?: string;
    products: OrderProduct[];
}
