import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LicenseDocument = License & Document;

@Schema({ timestamps: true })
export class License {
  @Prop({ required: true, unique: true })
  licenseKey: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  contactEmail: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'active', enum: ['active', 'expired', 'suspended', 'cancelled'] })
  status: string;

  @Prop({ default: 'basic', enum: ['basic', 'standard', 'premium', 'enterprise'] })
  plan: string;

  @Prop({ default: 1 })
  maxUsers: number;

  @Prop({ default: false })
  unlimitedUsers: boolean;

  @Prop({ type: [String], default: [] })
  allowedModules: string[];

  @Prop({ type: Object })
  features: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  lastValidation?: Date;

  @Prop({ default: 0 })
  validationCount: number;
}

export const LicenseSchema = SchemaFactory.createForClass(License);