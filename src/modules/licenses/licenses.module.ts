import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { License, LicenseSchema } from './schemas/license.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: License.name, schema: LicenseSchema },
    ]),
  ],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService],
})
export class LicensesModule {}