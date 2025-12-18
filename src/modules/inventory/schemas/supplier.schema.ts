import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true })
  name: string;

  @Prop()
  contactPerson?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  ruc?: string;

  @Prop()
  accountNumber?: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ type: Object })
  paymentTerms: Record<string, any>;

  @Prop({ type: [String] })
  productsSupplied: string[];

  @Prop({ default: 0 })
  totalPurchases: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);