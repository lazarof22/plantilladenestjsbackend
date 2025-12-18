import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  name: string;

  @Prop()
  identification?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ default: 'individual', enum: ['individual', 'company'] })
  type: string;

  @Prop({ default: 0 })
  creditLimit: number;

  @Prop({ default: 0 })
  currentBalance: number;

  @Prop({ type: Object })
  contactInfo: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ default: 0 })
  totalPurchases: number;

  @Prop()
  lastPurchaseDate?: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);