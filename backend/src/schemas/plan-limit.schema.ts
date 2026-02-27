import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanLimitDocument = PlanLimit & Document;

export type PlanType = 'subscription' | 'addon';

export type BillingPeriod = 'monthly' | 'yearly' | 'one_time';

@Schema({ collection: 'plan_limits', timestamps: true })
export class PlanLimit {
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop({ required: true, enum: ['subscription', 'addon'] })
  type: PlanType;

  @Prop({ required: true })
  price: number; // TL cinsinden fiyat (ör: 79)

  @Prop({
    required: true,
    enum: ['monthly', 'yearly', 'one_time'],
    default: 'monthly',
  })
  billingPeriod: BillingPeriod;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  isActive: boolean;
}
export const PlanLimitSchema = SchemaFactory.createForClass(PlanLimit);

