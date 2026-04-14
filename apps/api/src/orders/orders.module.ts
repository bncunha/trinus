import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';
import { InMemoryOrdersRepository, OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController],
  imports: [AuthModule],
  providers: [
    OrdersService,
    {
      provide: OrdersRepository,
      useClass: InMemoryOrdersRepository
    }
  ]
})
export class OrdersModule {}
