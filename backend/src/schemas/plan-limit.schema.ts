import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanLimitDocument = PlanLimit & Document;

export type PlanType = 'subscription' | 'addon';

export type BillingPeriod = 'monthly' | 'yearly' | 'one_time';

@Schema({ collection: 'plan_limits', timestamps: true })
export class PlanLimit {
  @Prop({ required: true, unique: true, index: true })
  code: string;

  @Prop()
  title?: string;

  @Prop()
  subtitle?: string;

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

  @Prop({
    type: {
      photosPerContent: Number,
      photosPerAlbum: Number,
      dailyQuiz: Number,
      storageBytes: Number,
      videoUpload: Boolean,
      maxVideoDuration: Number,
      adFree: Boolean,
      aiCommentFree: Boolean,
      weeklyReport: Boolean,
      yearlyReport: Boolean,
      allCosmetics: Boolean,
    },
  })
  limits?: {
    photosPerContent?: number;
    photosPerAlbum?: number;
    dailyQuiz?: number; // Sınırsız için istersen -1 veya çok büyük bir sayı tut
    storageBytes?: number;
    videoUpload?: boolean;
    maxVideoDuration?: number; // saniye
    adFree?: boolean;
    aiCommentFree?: boolean;
    weeklyReport?: boolean;
    yearlyReport?: boolean;
    allCosmetics?: boolean;
  };
}
export const PlanLimitSchema = SchemaFactory.createForClass(PlanLimit);
