import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MemoryReminderDocument = MemoryReminder & Document;

@Schema({ timestamps: true })
export class MemoryReminder {
  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true, index: true })
  coupleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Memory', required: true, index: true })
  memoryId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Number, default: 40 })
  intervalDays: number;

  @Prop({ type: Date, required: true, index: true })
  nextNotifyAt: Date;

  @Prop({ type: Date })
  lastNotifiedAt?: Date;

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Number })
  aiScore?: number;

  @Prop({ type: String })
  aiReason?: string;

  @Prop({ type: String })
  aiProvider?: string;

  @Prop({ type: String })
  aiModel?: string;
}

export const MemoryReminderSchema = SchemaFactory.createForClass(MemoryReminder);
MemoryReminderSchema.index({ coupleId: 1, nextNotifyAt: 1, isActive: 1 });
