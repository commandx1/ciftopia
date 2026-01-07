import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: ['pink', 'yellow', 'blue', 'green', 'purple', 'orange'],
    required: true,
  })
  color: string;

  @Prop({
    type: {
      x: Number,
      y: Number,
    },
    required: false,
  })
  position?: {
    x: number;
    y: number;
  };

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ required: false })
  readAt?: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

NoteSchema.index({ coupleId: 1, createdAt: -1 });
NoteSchema.index({ coupleId: 1, isRead: 1 });

