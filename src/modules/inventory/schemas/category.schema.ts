import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  parentCategory?: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const CategorySchema = SchemaFactory.createForClass(Category);