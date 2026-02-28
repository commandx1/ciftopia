import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PlanLimit,
  PlanLimitDocument,
  PlanType,
} from '../../schemas/plan-limit.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { SyncSubscriptionDto } from './dto/sync-subscription.dto';

export interface GroupedPlans {
  subscriptions: PlanLimit[];
  addons: PlanLimit[];
}

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(PlanLimit.name)
    private readonly planLimitModel: Model<PlanLimitDocument>,
    @InjectModel(Couple.name)
    private readonly coupleModel: Model<CoupleDocument>,
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

  async syncSubscription(coupleId: string, dto: SyncSubscriptionDto) {
    const couple = await this.coupleModel.findByIdAndUpdate(
      new Types.ObjectId(coupleId),
      {
        planCode: dto.planCode,
        ...(dto.revenueCatAppUserId && {
          revenueCatAppUserId: dto.revenueCatAppUserId,
        }),
      },
      { new: true },
    );
    if (!couple) return { success: false, message: 'Çift bulunamadı.' };
    return { success: true, planCode: couple.planCode };
  }
}
