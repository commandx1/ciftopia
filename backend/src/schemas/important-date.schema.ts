import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Couple } from './couple.schema';

export type ImportantDateDocument = ImportantDate & Document;

export interface PhotoMetadata {
  url: string;
  width?: number;
  height?: number;
  size?: number;
}

@Schema({ timestamps: true })
export class ImportantDate {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Couple;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  type: string; // 'dating', 'first_kiss', 'relationship', 'engagement', 'marriage', 'birthday', 'travel', 'moving', 'special'

  @Prop()
  description?: string;

  @Prop({ type: Object })
  photo?: PhotoMetadata;

  @Prop({ default: false })
  isRecurring: boolean; // Every year
}

export const ImportantDateSchema = SchemaFactory.createForClass(ImportantDate);
