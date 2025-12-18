import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { Employee, EmployeeSchema } from './schemas/empoylee.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}