import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';

@Module({
  controllers: [MasterDataController],
  imports: [AuthModule],
  providers: [MasterDataService]
})
export class MasterDataModule {}
