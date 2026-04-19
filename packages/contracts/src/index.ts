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

export type UpdateUserInput = Partial<CreateUserInput>;

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

export interface MeasurementUnit {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CreateMeasurementUnitInput {
  name: string;
  code: string;
  isActive?: boolean;
}

export type UpdateMeasurementUnitInput = Partial<CreateMeasurementUnitInput>;

export interface Variable {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateVariableInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateVariableInput = Partial<CreateVariableInput>;

export interface Sector {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateSectorInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateSectorInput = Partial<CreateSectorInput>;

export interface Stage {
  id: string;
  name: string;
  description?: string;
  sectorId: string;
  measurementUnitId: string;
  capacityPerWorkday: number;
  variableId?: string;
  position: number;
  isActive: boolean;
}

export interface CreateStageInput {
  name: string;
  description?: string;
  sectorId: string;
  measurementUnitId: string;
  capacityPerWorkday: number;
  variableId?: string;
  position?: number;
  isActive?: boolean;
}

export type UpdateStageInput = Partial<CreateStageInput>;

export interface TemplateItem {
  id: string;
  stageId: string;
  position: number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  items: TemplateItem[];
}

export interface CreateTemplateItemInput {
  stageId: string;
  position?: number;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  isActive?: boolean;
  items?: CreateTemplateItemInput[];
}

export interface UpdateTemplateInput extends Partial<Omit<CreateTemplateInput, 'items'>> {
  items?: CreateTemplateItemInput[];
}

export interface ClothingSize {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CreateClothingSizeInput {
  name: string;
  isActive?: boolean;
}

export type UpdateClothingSizeInput = Partial<CreateClothingSizeInput>;

export interface Customer {
  id: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  mobilePhone?: string;
  landlinePhone?: string;
  isActive: boolean;
}

export interface CreateCustomerInput {
  name: string;
  cpf?: string;
  cnpj?: string;
  address?: string;
  mobilePhone?: string;
  landlinePhone?: string;
  isActive?: boolean;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface ProductVariableDefault {
  id: string;
  variableId: string;
  value: number;
}

export interface Product {
  id: string;
  name: string;
  costPrice: number;
  salePrice: number;
  isActive: boolean;
  variableDefaults: ProductVariableDefault[];
}

export interface CreateProductVariableDefaultInput {
  variableId: string;
  value: number;
}

export interface CreateProductInput {
  name: string;
  costPrice: number;
  salePrice: number;
  isActive?: boolean;
  variableDefaults?: CreateProductVariableDefaultInput[];
}

export interface UpdateProductInput extends Partial<Omit<CreateProductInput, 'variableDefaults'>> {
  variableDefaults?: CreateProductVariableDefaultInput[];
}
