import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PlanLimit,
  PlanLimitDocument,
  PlanType,
} from '../../schemas/plan-limit.schema';

interface GroupedPlans {
  subscriptions: PlanLimit[];
  addons: PlanLimit[];
}

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(PlanLimit.name)
    private readonly planLimitModel: Model<PlanLimitDocument>,
  ) {}

  async getPlans(): Promise<GroupedPlans> {
    const plans = await this.planLimitModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean<PlanLimit[]>()
      .exec();

    const groupByType = (type: PlanType) =>
      plans.filter((p) => p.type === type);

    return {
      subscriptions: groupByType('subscription'),
      addons: groupByType('addon'),
    };
  }
}

