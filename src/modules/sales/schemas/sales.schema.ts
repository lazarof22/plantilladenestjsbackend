import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

class SaleItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ default: 0, min: 0 })
  taxRate: number;
}

@Schema({ timestamps: true })
export class Sale {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customer: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: [SaleItem], required: true })
  items: SaleItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  taxAmount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 'completed', enum: ['completed', 'pending', 'cancelled', 'refunded'] })
  status: string;

  @Prop({ default: 'cash', enum: ['cash', 'card', 'transfer', 'credit'] })
  paymentMethod: string;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 1 })
  exchangeRate: number;

  @Prop()
  notes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: string;

  @Prop({ type: Object })
  paymentDetails: Record<string, any>;

  @Prop({ default: 0 })
  changeAmount: number;

  @Prop({ default: 0 })
  amountPaid: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export type SaleDocument = Sale & Document;
export const SaleSchema = SchemaFactory.createForClass(Sale);