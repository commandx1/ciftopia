import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PoemDocument = Poem & Document;

@Schema({ timestamps: true })
export class Poem {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  dedicatedTo?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false, index: true })
  isPublic: boolean;
}

export const PoemSchema = SchemaFactory.createForClass(Poem);

PoemSchema.index({ coupleId: 1, createdAt: -1 });
