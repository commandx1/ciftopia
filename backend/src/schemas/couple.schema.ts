import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CoupleDocument = Couple & Document;

@Schema({ timestamps: true })
export class Couple {
  @Prop({ required: true, unique: true, index: true, lowercase: true })
  subdomain: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  partner1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  partner2: Types.ObjectId;

  @Prop({ required: true })
  coupleName: string;

  @Prop()
  relationshipStartDate?: Date;

  @Prop({ enum: ['dating', 'engaged', 'married'], default: 'dating' })
  relationshipStatus: string;

  @Prop({
    type: {
      template: String,
      primaryColor: String,
      font: String,
    },
    default: {
      template: 'default',
      primaryColor: '#E91E63',
      font: 'sans',
    },
  })
  theme: {
    template: string;
    primaryColor: string;
    font: string;
  };

  @Prop({
    type: {
      isPublic: Boolean,
      language: String,
    },
    default: {
      isPublic: false,
      language: 'tr',
    },
  })
  settings: {
    isPublic: boolean;
    language: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscriptionId?: Types.ObjectId;

  @Prop({ default: 0 })
  storageUsed: number;

  @Prop({
    required: true,
    enum: ['pending_payment', 'active', 'suspended', 'deleted'],
    default: 'pending_payment',
    index: true,
  })
  status: string;
}

export const CoupleSchema = SchemaFactory.createForClass(Couple);
