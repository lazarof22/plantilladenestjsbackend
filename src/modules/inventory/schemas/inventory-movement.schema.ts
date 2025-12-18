import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InventoryMovementDocument = InventoryMovement & Document;

@Schema({ timestamps: true })
export class InventoryMovement {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: string;

  @Prop({ required: true, enum: ['in', 'out', 'adjustment'] })
  type: string;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  previousStock: number;

  @Prop({ required: true, min: 0 })
  newStock: number;

  @Prop({ required: true })
  reason: string;

  @Prop()
  reference?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ min: 0 })
  unitCost?: number;

  @Prop({ min: 0 })
  totalCost?: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);