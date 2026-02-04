import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class QuestionProgress {
  @Prop({ type: Map, of: String, default: {} })
  selfAnswers: Map<string, string>;

  @Prop({ type: Map, of: String, default: {} })
  guesses: Map<string, string>;
}

export type QuizSessionDocument = QuizSession & Document;

@Schema({ timestamps: true })
export class QuizSession {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['waiting', 'in_progress', 'finished'],
    default: 'waiting',
  })
  status: string;

  @Prop({ default: 0 })
  currentQuestionIndex: number;

  @Prop({ type: [QuestionProgress], default: [{}, {}, {}, {}, {}] })
  questionsData: QuestionProgress[];

  @Prop({ type: Map, of: Number, default: {} })
  scores: Map<string, number>;

  @Prop()
  category: string;

  @Prop()
  startedAt: Date;

  @Prop()
  finishedAt?: Date;
}

export const QuizSessionSchema = SchemaFactory.createForClass(QuizSession);
