import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_ROLES, type AuthSession, type CreateUserInput, type LoginInput, type RegisterAccountInput } from '@trinus/contracts';
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
}
