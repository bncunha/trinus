import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { CreateOrderInput, Order, UpdateOrderInput } from '@trinus/contracts';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.decorators';
import { RolesGuard } from '../auth/roles.guard';
import type { RequestWithAuth } from '../auth/auth.types';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getOrders(@Req() request: RequestWithAuth): Promise<Order[]> {
    return this.ordersService.findAll(request.auth.user.companyId);
  }

  @Get(':id')
  async getOrderById(@Req() request: RequestWithAuth, @Param('id') id: string): Promise<Order> {
    const order = await this.ordersService.findById(request.auth.user.companyId, id);

    if (order === null) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  @Post()
  createOrder(@Req() request: RequestWithAuth, @Body() body: CreateOrderInput): Promise<Order> {
    return this.ordersService.create(request.auth.user.companyId, body);
  }

  @Patch(':id')
  async updateOrder(@Req() request: RequestWithAuth, @Param('id') id: string, @Body() body: UpdateOrderInput): Promise<Order> {
    const order = await this.ordersService.update(request.auth.user.companyId, id, body);

    if (order === null) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
