import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CoupleKeyDocument = CoupleKey & Document;

@Schema({ timestamps: true })
export class CoupleKey {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, unique: true })
  coupleId: Types.ObjectId;

  @Prop({ required: true })
  wrappedKey: string;

  @Prop({ default: 1 })
  keyVersion: number;
}

export const CoupleKeySchema = SchemaFactory.createForClass(CoupleKey);
CoupleKeySchema.index({ coupleId: 1 }, { unique: true });
