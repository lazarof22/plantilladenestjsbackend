import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

class PurchaseItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitCost: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 0, min: 0 })
  tax: number;
}

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ required: true, unique: true })
  purchaseNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Supplier' })
  supplier: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: [PurchaseItem], required: true })
  items: PurchaseItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  taxAmount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'cancelled', 'partial'] })
  status: string;

  @Prop({ default: 'cash', enum: ['cash', 'credit', 'transfer'] })
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
  paymentTerms: Record<string, any>;

  @Prop()
  expectedDelivery?: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export type PurchaseDocument = Purchase & Document;

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);