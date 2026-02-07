import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MoodDocument = Mood & Document;

@Schema({ timestamps: true })
export class Mood {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  emoji: string;

  @Prop({ required: false })
  note?: string;

  @Prop({ required: true, type: Date, index: true })
  date: Date;
}

export const MoodSchema = SchemaFactory.createForClass(Mood);

MoodSchema.index({ coupleId: 1, date: -1 });
MoodSchema.index({ userId: 1, date: -1 });
MoodSchema.index({ coupleId: 1, userId: 1, date: 1 }, { unique: true });
