import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BucketListItemDocument = BucketListItem & Document;

@Schema({ timestamps: true })
export class BucketListItem {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: ['travel', 'food', 'experience', 'home', 'relationship'],
    default: 'experience',
  })
  category: string;

  @Prop()
  targetDate?: Date;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  completedAt?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  completedBy: Types.ObjectId[];

  @Prop({
    type: [
      {
        url: String,
        width: Number,
        height: Number,
        size: Number,
      },
    ],
  })
  photos?: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  }[];
}

export const BucketListItemSchema =
  SchemaFactory.createForClass(BucketListItem);
BucketListItemSchema.index({ coupleId: 1, isCompleted: 1, createdAt: -1 });
