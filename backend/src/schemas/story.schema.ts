import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoryDocument = Story & Document;

@Schema({ timestamps: true })
export class Story {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Date, default: () => new Date(), index: true })
  date: Date;

  /** TTS ile üretilen ses dosyası (S3 key). */
  @Prop({ type: String })
  audioKey?: string;

  /** Metin üretimi: prompt token sayısı (GPT/Gemini). */
  @Prop({ type: Number })
  textPromptTokens?: number;

  /** Metin üretimi: completion token sayısı (GPT/Gemini). */
  @Prop({ type: Number })
  textCompletionTokens?: number;

  /** TTS'e gönderilen karakter sayısı (TTS token değil, karakter bazlı fiyatlandırılır). */
  @Prop({ type: Number })
  ttsInputCharacters?: number;
}

export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ coupleId: 1, date: -1 });
