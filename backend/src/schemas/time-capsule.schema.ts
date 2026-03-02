import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimeCapsuleDocument = TimeCapsule & Document;

@Schema({ timestamps: true })
export class TimeCapsule {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  unlockDate: Date;

  @Prop({
    type: [
      {
        key: String,
        url: String,
        width: Number,
        height: Number,
        size: Number,
      },
    ],
  })
  photos: {
    key: string;
    url: string;
    width?: number;
    height?: number;
    size: number;
  }[];

  @Prop({
    type: {
      key: String,
      url: String,
      size: Number,
    },
  })
  video?: {
    key: string;
    url: string;
    size: number;
  };

  @Prop({
    type: String,
    enum: ['me', 'partner', 'both'],
    default: 'both',
  })
  receiver: string;

  @Prop({ default: false })
  isOpened: boolean;

  @Prop({
    type: [
      {
        authorId: { type: Types.ObjectId, ref: 'User' },
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  reflections: {
    authorId: Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
}

export const TimeCapsuleSchema = SchemaFactory.createForClass(TimeCapsule);
