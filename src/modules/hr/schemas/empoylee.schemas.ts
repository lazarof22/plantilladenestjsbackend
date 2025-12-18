import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true })
  employeeId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  identification: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Department' })
  department: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true, min: 0 })
  salary: number;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'suspended', 'vacation'] })
  status: string;

  @Prop()
  hireDate: Date;

  @Prop()
  birthDate?: Date;

  @Prop({ type: Object })
  bankInfo: Record<string, any>;

  @Prop({ type: Object })
  emergencyContact: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);