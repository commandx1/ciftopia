import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlanLimit, PlanLimitDocument } from '../../schemas/plan-limit.schema';
import { PlanLimitsDto, DEFAULT_FREE_LIMITS } from './plan-limits.types';

@Injectable()
export class PlanLimitsService {
  constructor(
    @InjectModel(PlanLimit.name)
    private readonly planLimitModel: Model<PlanLimitDocument>,
  ) {}

  /**
   * Plan koduna göre limitleri döndürür. Tek kaynak: plan_limits koleksiyonu.
   * Plan bulunamazsa free limitleri, free yoksa DEFAULT_FREE_LIMITS döner.
   */
  async getLimits(planCode: string): Promise<PlanLimitsDto> {
    const normalized = (planCode || 'free').trim().toLowerCase();
    const doc = await this.planLimitModel
      .findOne({ code: normalized, isActive: true })
      .lean()
      .exec();

    if (doc?.limits && typeof doc.limits === 'object') {
      return { ...DEFAULT_FREE_LIMITS, ...doc.limits } as PlanLimitsDto;
    }

    if (normalized !== 'free') {
      return this.getLimits('free');
    }

    return { ...DEFAULT_FREE_LIMITS };
  }

  /**
   * Belirli bir aksiyonun plana göre yapılıp yapılamayacağını kontrol eder.
   * - boolean limitler (adFree, aiCommentFree, videoUpload vb.): limit === true ise izin var.
   * - sayısal limitler (dailyQuiz, photosPerContent vb.): currentCount < limit (veya -1 sınırsız).
   */
  async canDoAction(
    planCode: string,
    action: keyof PlanLimitsDto,
    currentCount?: number,
  ): Promise<boolean> {
    const limits = await this.getLimits(planCode);
    const value = limits[action];

    if (value === undefined) return true;

    if (typeof value === 'boolean') return value === true;

    if (typeof value === 'number') {
      if (value < 0) return true; // -1 = sınırsız
      if (currentCount !== undefined) return currentCount < value;
      return true;
    }

    return true;
  }
}
