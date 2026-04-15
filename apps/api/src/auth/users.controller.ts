import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthUser, CreateUserInput, UpdateUserInput } from '@trinus/contracts';
import { AccountsRepository } from './accounts.repository';
import { AuthService } from './auth.service';
import { Roles } from './auth.decorators';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import type { RequestWithAuth } from './auth.types';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly authService: AuthService
  ) {}

  @Get()
  getUsers(@Req() request: RequestWithAuth): Promise<AuthUser[]> {
    return this.accountsRepository.listUsers(request.auth.user.companyId);
  }

  @Post()
  createUser(@Req() request: RequestWithAuth, @Body() body: CreateUserInput): Promise<AuthUser> {
    return this.authService.createUser(request.auth.user.companyId, body);
  }

  @Patch(':userId')
  updateUser(
    @Req() request: RequestWithAuth,
    @Param('userId') userId: string,
    @Body() body: UpdateUserInput
  ): Promise<AuthUser> {
    return this.authService.updateUser(request.auth.user.companyId, userId, body);
  }

  @Delete(':userId')
  deleteUser(@Req() request: RequestWithAuth, @Param('userId') userId: string): Promise<void> {
    return this.authService.deleteUser(request.auth.user.companyId, userId, request.auth.user.id);
  }
}
