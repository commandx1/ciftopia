import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailyQuestionDocument = DailyQuestion & Document;

@Schema({ timestamps: true })
export class DailyQuestion {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true, enum: ['deep', 'fun', 'memory', 'future', 'challenge'] })
  category: string;

  @Prop({ required: true })
  emoji: string;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop()
  aiAnalysis?: string;
}

export const DailyQuestionSchema = SchemaFactory.createForClass(DailyQuestion);
DailyQuestionSchema.index({ coupleId: 1, date: -1 });
