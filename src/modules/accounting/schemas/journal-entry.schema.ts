import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

class JournalEntryItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account', required: true })
  account: string;

  @Prop({ required: true, min: 0 })
  debit: number;

  @Prop({ required: true, min: 0 })
  credit: number;

  @Prop({ required: true })
  description: string;
}

@Schema({ timestamps: true })
export class JournalEntry {
  @Prop({ required: true, unique: true })
  entryNumber: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [JournalEntryItem], required: true })
  items: JournalEntryItem[];

  @Prop({ required: true, min: 0 })
  totalDebit: number;

  @Prop({ required: true, min: 0 })
  totalCredit: number;

  @Prop({ default: 'posted', enum: ['draft', 'posted', 'cancelled'] })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: string;

  @Prop()
  reference?: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);