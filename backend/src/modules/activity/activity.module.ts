import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { Activity, ActivitySchema } from '../../schemas/activity.schema';
import { ActivityController } from './activity.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Activity.name, schema: ActivitySchema }]),
    UploadModule,
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
  exports: [ActivityService],
})
export class ActivityModule {}
