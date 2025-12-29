import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  avatar?: string;

  @Prop({ type: Types.ObjectId, ref: 'Couple', index: true })
  coupleId?: Types.ObjectId;

  @Prop({ required: true, enum: ['partner1', 'partner2'] })
  role: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ index: true })
  emailVerifyToken?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
