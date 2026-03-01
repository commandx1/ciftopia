import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanLimit, PlanLimitSchema } from '../../schemas/plan-limit.schema';
import { PlanLimitsService } from './plan-limits.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanLimit.name, schema: PlanLimitSchema },
    ]),
  ],
  providers: [PlanLimitsService],
  exports: [PlanLimitsService],
})
export class PlanLimitsModule {}
