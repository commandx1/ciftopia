import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CoupleQuestionStatsDocument = CoupleQuestionStats & Document;

@Schema({ timestamps: true })
export class CoupleQuestionStats {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, unique: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ default: 0 })
  totalAnswered: number;

  @Prop()
  lastAnsweredDate: Date;

  @Prop({
    type: {
      deep: { type: Number, default: 0 },
      fun: { type: Number, default: 0 },
      memory: { type: Number, default: 0 },
      future: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
    },
    default: { deep: 0, fun: 0, memory: 0, future: 0, challenge: 0 },
  })
  categoryBreakdown: {
    deep: number;
    fun: number;
    memory: number;
    future: number;
    challenge: number;
  };
}

export const CoupleQuestionStatsSchema = SchemaFactory.createForClass(CoupleQuestionStats);
