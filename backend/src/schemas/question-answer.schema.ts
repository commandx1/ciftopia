import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionAnswerDocument = QuestionAnswer & Document;

@Schema({ timestamps: true })
export class QuestionAnswer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'DailyQuestion',
    required: true,
    index: true,
  })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  answer: string;

  @Prop({ default: Date.now })
  answeredAt: Date;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({ default: false })
  viewedPartnerAnswer: boolean;
}

export const QuestionAnswerSchema =
  SchemaFactory.createForClass(QuestionAnswer);
QuestionAnswerSchema.index({ questionId: 1, userId: 1 }, { unique: true });
QuestionAnswerSchema.index({ coupleId: 1, questionId: 1 });
