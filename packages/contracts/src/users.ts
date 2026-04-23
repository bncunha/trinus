export const USER_ROLES = ['ADMIN', 'MANAGER', 'OPERATOR'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  isActive?: boolean;
}

export type UpdateUserInput = Partial<CreateUserInput>;
