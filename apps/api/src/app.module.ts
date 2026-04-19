import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { MasterDataModule } from './master-data/master-data.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  controllers: [HealthController],
  imports: [PrismaModule, AuthModule, OrdersModule, MasterDataModule]
})
export class AppModule {}
