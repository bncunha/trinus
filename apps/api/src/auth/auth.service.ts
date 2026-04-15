import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_ROLES,
  type AuthSession,
  type AuthUser,
  type CreateUserInput,
  type LoginInput,
  type RegisterAccountInput,
  type UpdateUserInput
} from '@trinus/contracts';
import { AccountsRepository } from './accounts.repository';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly passwordService: PasswordService
  ) {}

  async register(input: RegisterAccountInput): Promise<AuthSession> {
    this.validateAccountInput(input);
    const passwordHash = await this.passwordService.hash(input.password);

    return this.accountsRepository.createAccount(input, passwordHash);
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const user = await this.accountsRepository.findStoredUserByEmail(input.email);
    const isValidPassword = user?.passwordHash
      ? await this.passwordService.verify(input.password, user.passwordHash)
      : false;

    if (!user || !user.isActive || !isValidPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const session = await this.accountsRepository.findSessionByUserId(user.id);

    if (!session) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return session;
  }

  async createUser(companyId: string, input: CreateUserInput) {
    if (!input.name?.trim() || !input.email?.trim()) {
      throw new BadRequestException('User name and email are required.');
    }

    if (!USER_ROLES.includes(input.role)) {
      throw new BadRequestException('Invalid user role.');
    }

    if (input.isActive !== false && !input.password?.trim()) {
      throw new BadRequestException('Active users must have a password.');
    }

    const passwordHash = input.password ? await this.passwordService.hash(input.password) : null;

    return this.accountsRepository.createUser(companyId, input, passwordHash);
  }

  async updateUser(companyId: string, userId: string, input: UpdateUserInput): Promise<AuthUser> {
    this.validateUserUpdateInput(input);
    await this.ensureActiveAdminRemains(companyId, userId, input);
    const passwordHash = input.password?.trim() ? await this.passwordService.hash(input.password) : null;

    return this.accountsRepository.updateUser(companyId, userId, input, passwordHash);
  }

  async deleteUser(companyId: string, userId: string, currentUserId: string): Promise<void> {
    if (userId === currentUserId) {
      throw new BadRequestException('Users cannot delete themselves.');
    }

    await this.ensureActiveAdminRemains(companyId, userId, { isActive: false });

    return this.accountsRepository.deleteUser(companyId, userId);
  }

  async getSessionByUserId(userId: string, companyId: string): Promise<AuthSession> {
    const session = await this.accountsRepository.findSessionByUserId(userId);

    if (!session || session.user.companyId !== companyId) {
      throw new UnauthorizedException('Invalid session.');
    }

    return session;
  }

  private validateAccountInput(input: RegisterAccountInput): void {
    if (!input.companyName?.trim() || !input.name?.trim() || !input.email?.trim() || !input.password?.trim()) {
      throw new BadRequestException('Company, user, email and password are required.');
    }
  }

  private validateUserUpdateInput(input: UpdateUserInput): void {
    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestException('User name is required.');
    }

    if (input.email !== undefined && !input.email.trim()) {
      throw new BadRequestException('User email is required.');
    }

    if (input.role !== undefined && !USER_ROLES.includes(input.role)) {
      throw new BadRequestException('Invalid user role.');
    }
  }

  private async ensureActiveAdminRemains(companyId: string, userId: string, input: UpdateUserInput): Promise<void> {
    const users = await this.accountsRepository.listUsers(companyId);
    const currentUser = users.find((user) => user.id === userId);

    if (!currentUser || currentUser.role !== 'ADMIN' || !currentUser.isActive) {
      return;
    }

    const keepsCurrentUserAdmin = (input.role ?? currentUser.role) === 'ADMIN' && (input.isActive ?? currentUser.isActive);

    if (keepsCurrentUserAdmin) {
      return;
    }

    const activeAdminCount = users.filter((user) => user.role === 'ADMIN' && user.isActive).length;

    if (activeAdminCount <= 1) {
      throw new BadRequestException('At least one active administrator is required.');
    }
  }
}
