import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlanLimit,
  PlanLimitSchema,
} from '../../schemas/plan-limit.schema';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanLimit.name, schema: PlanLimitSchema },
    ]),
  ],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}

