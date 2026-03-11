import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoriesController } from './memories.controller';
import { MemoriesService } from './memories.service';
import { Memory, MemorySchema } from '../../schemas/memory.schema';
import {
  MemoryReminder,
  MemoryReminderSchema,
} from '../../schemas/memory-reminder.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Story, StorySchema } from '../../schemas/story.schema';
import { UploadModule } from '../upload/upload.module';
import { ActivityModule } from '../activity/activity.module';
import { NotificationModule } from '../notification/notification.module';
import { EventsModule } from '../events/events.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Memory.name, schema: MemorySchema },
      { name: MemoryReminder.name, schema: MemoryReminderSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: Story.name, schema: StorySchema },
    ]),
    UploadModule,
    ActivityModule,
    NotificationModule,
    EventsModule,
    SecurityModule,
  ],
  controllers: [MemoriesController],
  providers: [MemoriesService],
  exports: [MemoriesService],
})
export class MemoriesModule {}
