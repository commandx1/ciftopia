import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImportantDatesController } from './important-dates.controller';
import { ImportantDatesService } from './important-dates.service';
import {
  ImportantDate,
  ImportantDateSchema,
} from '../../schemas/important-date.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { UploadModule } from '../upload/upload.module';
import { ActivityModule } from '../activity/activity.module';
import { NotificationModule } from '../notification/notification.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ImportantDate.name, schema: ImportantDateSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
    UploadModule,
    ActivityModule,
    NotificationModule,
    SecurityModule,
  ],
  controllers: [ImportantDatesController],
  providers: [ImportantDatesService],
  exports: [ImportantDatesService],
})
export class ImportantDatesModule {}
