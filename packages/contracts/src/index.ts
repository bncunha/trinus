export type OrderStatus = 'REGISTERED' | 'IN_PROGRESS' | 'PAUSED' | 'CANCELED' | 'FINISHED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const USER_ROLES = ['ADMIN', 'MANAGER', 'OPERATOR'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthCompany {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthSession {
  user: AuthUser;
  company: AuthCompany;
}

export interface RegisterAccountInput {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  isActive?: boolean;
}

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
  finalNotes?: string;
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
  finalNotes?: string;
  products: OrderProduct[];
}

export type UpdateOrderInput = Partial<CreateOrderInput>;
