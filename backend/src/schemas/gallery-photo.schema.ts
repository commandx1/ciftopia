import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GalleryPhotoDocument = GalleryPhoto & Document;

@Schema({ timestamps: true })
export class GalleryPhoto {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Album', index: true })
  albumId?: Types.ObjectId;

  @Prop({
    type: {
      url: String,
      width: Number,
      height: Number,
      size: Number,
    },
    required: true,
  })
  photo: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  };

  @Prop()
  caption?: string;
}

export const GalleryPhotoSchema = SchemaFactory.createForClass(GalleryPhoto);
GalleryPhotoSchema.index({ coupleId: 1, createdAt: -1 });
GalleryPhotoSchema.index({ albumId: 1, createdAt: -1 });
