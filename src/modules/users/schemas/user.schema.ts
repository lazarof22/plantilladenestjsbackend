import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: ['admin', 'user', 'manager', 'cashier'] })
  role: string;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended'] })
  status: string;

  @Prop()
  department?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ type: Object })
  permissions: Record<string, any>;

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop()
  lockUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);