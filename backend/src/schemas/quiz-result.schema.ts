import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuizResult {
  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'QuizSession', required: true, unique: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Map, of: Number, required: true })
  scores: Map<string, number>;

  @Prop({ type: Array, default: [] })
  details: any[];

  @Prop()
  category: string;

  @Prop()
  finishedAt: Date;
}

export type QuizResultDocument = QuizResult & Document;
export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);
