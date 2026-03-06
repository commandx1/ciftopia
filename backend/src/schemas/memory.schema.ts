import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoryDocument = Memory & Document;

@Schema({ timestamps: true })
export class Memory {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  date: Date;

  @Prop({
    type: {
      name: String,
      coordinates: [Number],
    },
    required: false,
  })
  location?: {
    name: string;
    coordinates?: [number, number];
  };

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
  photos: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  }[];

  @Prop({
    type: String,
    enum: ['romantic', 'fun', 'emotional', 'adventure'],
    required: false,
  })
  mood?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  favorites: Types.ObjectId[];

  /** Anıdan üretilen şarkı S3 key (müzik üret butonu ile doldurulur) */
  @Prop({ type: String, required: false })
  generatedSongKey?: string;

  /** Üretilen şarkının süresi (saniye); Suno record-info response'tan alınır. */
  @Prop({ type: Number, required: false })
  generatedSongDurationSeconds?: number;

  /** Suno ile üretilen şarkı sözleri (memories collection'a kaydedilir) */
  @Prop({ type: String, required: false })
  generatedLyrics?: string;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);

// Indexes for performance
MemorySchema.index({ coupleId: 1, date: -1 });
MemorySchema.index({ coupleId: 1, createdAt: -1 });
