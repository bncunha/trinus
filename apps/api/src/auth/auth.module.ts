import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { AccountsRepository, PrismaAccountsRepository } from './accounts.repository';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController, UsersController],
  exports: [AccountsRepository, AuthGuard, RolesGuard, TokenService],
  providers: [
    {
      provide: AccountsRepository,
      useClass: PrismaAccountsRepository
    },
    AuthGuard,
    AuthService,
    PasswordService,
    RolesGuard,
    TokenService
  ]
})
export class AuthModule {}
