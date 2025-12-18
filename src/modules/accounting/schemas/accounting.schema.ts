import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccountDocument = Account & Document;

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['asset', 'liability', 'equity', 'income', 'expense'] })
  type: string;

  @Prop({ required: true, enum: ['debit', 'credit'] })
  nature: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  parentAccount?: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const AccountSchema = SchemaFactory.createForClass(Account);