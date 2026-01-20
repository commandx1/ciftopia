import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Feedback extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  subdomain: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  partner1: string;

  @Prop({ required: true })
  partner2: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: [String], required: true })
  features: string[];

  @Prop({ required: true })
  likedFeatures: string;

  @Prop({ required: true })
  improvements: string;

  @Prop()
  bugs: string;

  @Prop()
  featureRequests: string;

  @Prop({ required: true })
  device: string;

  @Prop({ required: true })
  frequency: string;

  @Prop({ required: true, min: 1, max: 10 })
  easeOfUse: number;

  @Prop({ required: true, min: 1, max: 10 })
  design: number;

  @Prop({ required: true, min: 1, max: 10 })
  performance: number;

  @Prop({ required: true })
  recommend: string;

  @Prop({ required: true })
  wouldPay: string;

  @Prop()
  priceRange: string;

  @Prop()
  additionalComments: string;

  @Prop({ required: true })
  consent: boolean;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
