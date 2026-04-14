import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthCompany, AuthSession, AuthUser, CreateUserInput, RegisterAccountInput } from '@trinus/contracts';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

type StoredUser = AuthUser & {
  passwordHash: string | null;
};

type UserRecord = StoredUser & {
  createdAt?: Date;
  updatedAt?: Date;
};

export abstract class AccountsRepository {
  abstract createAccount(input: RegisterAccountInput, passwordHash: string): Promise<AuthSession>;
  abstract createUser(companyId: string, input: CreateUserInput, passwordHash: string | null): Promise<AuthUser>;
  abstract findStoredUserByEmail(email: string): Promise<StoredUser | null>;
  abstract findSessionByUserId(userId: string): Promise<AuthSession | null>;
  abstract listUsers(companyId: string): Promise<AuthUser[]>;
}

export class InMemoryAccountsRepository extends AccountsRepository {
  private readonly companies: AuthCompany[] = [];
  private readonly users: StoredUser[] = [];

  async createAccount(input: RegisterAccountInput, passwordHash: string): Promise<AuthSession> {
    const normalizedEmail = this.normalizeEmail(input.email);

    if (this.users.some((user) => user.email === normalizedEmail)) {
      throw new ConflictException('Account already exists.');
    }

    const company: AuthCompany = {
      id: randomUUID(),
      name: input.companyName.trim()
    };
    const user: StoredUser = {
      id: randomUUID(),
      companyId: company.id,
      name: input.name.trim(),
      email: normalizedEmail,
      role: 'ADMIN',
      isActive: true,
      passwordHash
    };

    this.companies.push(company);
    this.users.push(user);

    return this.toSession(user, company);
  }

  async createUser(companyId: string, input: CreateUserInput, passwordHash: string | null): Promise<AuthUser> {
    const company = this.findCompanyById(companyId);
    const normalizedEmail = this.normalizeEmail(input.email);

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    if (this.users.some((user) => user.email === normalizedEmail)) {
      throw new ConflictException('User already exists.');
    }

    const user: StoredUser = {
      id: randomUUID(),
      companyId,
      name: input.name.trim(),
      email: normalizedEmail,
      role: input.role,
      isActive: input.isActive ?? true,
      passwordHash
    };

    this.users.push(user);

    return this.toPublicUser(user);
  }

  async findStoredUserByEmail(email: string): Promise<StoredUser | null> {
    return this.users.find((user) => user.email === this.normalizeEmail(email)) ?? null;
  }

  async findSessionByUserId(userId: string): Promise<AuthSession | null> {
    const user = this.users.find((item) => item.id === userId);

    if (!user || !user.isActive) {
      return null;
    }

    const company = this.findCompanyById(user.companyId);

    return company ? this.toSession(user, company) : null;
  }

  async listUsers(companyId: string): Promise<AuthUser[]> {
    return this.users.filter((user) => user.companyId === companyId).map((user) => this.toPublicUser(user));
  }

  private findCompanyById(companyId: string): AuthCompany | null {
    return this.companies.find((company) => company.id === companyId) ?? null;
  }

  private toSession(user: StoredUser, company: AuthCompany): AuthSession {
    return {
      user: this.toPublicUser(user),
      company: { ...company }
    };
  }

  private toPublicUser(user: StoredUser): AuthUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;

    return { ...publicUser };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}

@Injectable()
export class PrismaAccountsRepository extends AccountsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createAccount(input: RegisterAccountInput, passwordHash: string): Promise<AuthSession> {
    const normalizedEmail = this.normalizeEmail(input.email);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      throw new ConflictException('Account already exists.');
    }

    const result = await this.prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const company = await transaction.company.create({
        data: {
          name: input.companyName.trim()
        }
      });
      const user = await transaction.user.create({
        data: {
          companyId: company.id,
          name: input.name.trim(),
          email: normalizedEmail,
          role: 'ADMIN',
          isActive: true,
          passwordHash
        }
      });

      return { company, user };
    });

    return this.toSession(result.user, result.company);
  }

  async createUser(companyId: string, input: CreateUserInput, passwordHash: string | null): Promise<AuthUser> {
    const normalizedEmail = this.normalizeEmail(input.email);

    const [company, existingUser] = await Promise.all([
      this.prisma.company.findUnique({ where: { id: companyId } }),
      this.prisma.user.findUnique({ where: { email: normalizedEmail } })
    ]);

    if (!company) {
      throw new NotFoundException('Company not found.');
    }

    if (existingUser) {
      throw new ConflictException('User already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        companyId,
        name: input.name.trim(),
        email: normalizedEmail,
        role: input.role,
        isActive: input.isActive ?? true,
        passwordHash
      }
    });

    return this.toPublicUser(user);
  }

  async findStoredUserByEmail(email: string): Promise<StoredUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) }
    });

    return user ? this.toStoredUser(user) : null;
  }

  async findSessionByUserId(userId: string): Promise<AuthSession | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.toSession(user, user.company);
  }

  async listUsers(companyId: string): Promise<AuthUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      where: { companyId }
    });

    return users.map((user) => this.toPublicUser(user));
  }

  private toSession(user: StoredUser, company: AuthCompany): AuthSession {
    return {
      user: this.toPublicUser(user),
      company: this.toCompany(company)
    };
  }

  private toCompany(company: AuthCompany): AuthCompany {
    return {
      id: company.id,
      name: company.name
    };
  }

  private toStoredUser(user: UserRecord): StoredUser {
    return {
      id: user.id,
      companyId: user.companyId,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordHash: user.passwordHash
    };
  }

  private toPublicUser(user: StoredUser): AuthUser {
    const { passwordHash: _passwordHash, ...publicUser } = this.toStoredUser(user);

    return publicUser;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
