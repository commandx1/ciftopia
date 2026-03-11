import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CiftoConversationDocument = CiftoConversation & Document;

@Schema({ _id: false })
export class CiftoMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class CiftoConversation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Couple' })
  coupleId?: Types.ObjectId;

  @Prop({ type: [CiftoMessage], default: [] })
  messages: CiftoMessage[];

  @Prop({ type: Date, default: null })
  lastMessageAt?: Date | null;
}

export const CiftoConversationSchema = SchemaFactory.createForClass(CiftoConversation);
CiftoConversationSchema.index({ userId: 1 }, { unique: true });
CiftoConversationSchema.index({ coupleId: 1, updatedAt: -1 });
