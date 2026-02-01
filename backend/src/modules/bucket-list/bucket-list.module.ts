import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BucketListController } from './bucket-list.controller';
import { BucketListService } from './bucket-list.service';
import {
  BucketListItem,
  BucketListItemSchema,
} from '../../schemas/bucket-list.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { ActivityModule } from '../activity/activity.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BucketListItem.name, schema: BucketListItemSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
    ActivityModule,
    NotificationModule,
  ],
  controllers: [BucketListController],
  providers: [BucketListService],
})
export class BucketListModule {}
