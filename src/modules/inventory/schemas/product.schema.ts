import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Supplier' })
  supplier: string;

  @Prop({ default: 'unit' })
  unit: string;

  @Prop({ required: true, min: 0 })
  purchasePrice: number;

  @Prop({ required: true, min: 0 })
  salePrice: number;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ required: true, min: 0 })
  minStock: number;

  @Prop({ required: true, min: 0 })
  maxStock: number;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  description?: string;

  @Prop()
  barcode?: string;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ type: Object })
  attributes: Record<string, any>;

  @Prop({ default: 0 })
  totalSold: number;

  @Prop({ default: 0 })
  totalPurchased: number;

  @Prop()
  location?: string;

  @Prop({ default: false })
  hasExpiry: boolean;

  @Prop()
  expiryDate?: Date;

  @Prop({ type: [String] })
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);