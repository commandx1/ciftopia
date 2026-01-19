import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Couple', required: true })
  coupleId: Types.ObjectId;

  @Prop({ required: true })
  module: string; // 'memories', 'gallery', 'bucket-list', 'important-dates', 'poems', 'notes', 'time-capsule', 'daily-question'

  @Prop({ required: true })
  actionType: 'create' | 'update' | 'delete' | 'answer' | 'favorite';

  @Prop()
  resourceId: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Object })
  metadata: any;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
