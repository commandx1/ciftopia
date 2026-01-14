import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AlbumDocument = Album & Document;

@Schema({ timestamps: true })
export class Album {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: {
      url: String,
      width: Number,
      height: Number,
      size: Number,
    },
  })
  coverPhoto?: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  };

  @Prop({ default: 0 })
  photoCount: number;

  @Prop({ default: Date.now })
  date: Date;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
AlbumSchema.index({ coupleId: 1, date: -1 });
