import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, type: [String] })
  options: string[];
}

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  category: string;

  @Prop({ type: [QuizQuestion], required: true })
  questions: QuizQuestion[];

  @Prop({ default: true })
  isActive: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
