import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Memory, MemorySchema } from '../../schemas/memory.schema';
import { Album, AlbumSchema } from '../../schemas/album.schema';
import { GalleryPhoto, GalleryPhotoSchema } from '../../schemas/gallery-photo.schema';
import { BucketListItem, BucketListItemSchema } from '../../schemas/bucket-list.schema';
import { ImportantDate, ImportantDateSchema } from '../../schemas/important-date.schema';
import { TimeCapsule, TimeCapsuleSchema } from '../../schemas/time-capsule.schema';
import { Poem, PoemSchema } from '../../schemas/poem.schema';
import { Note, NoteSchema } from '../../schemas/note.schema';
import { Activity, ActivitySchema } from '../../schemas/activity.schema';
import { QuestionAnswer, QuestionAnswerSchema } from '../../schemas/question-answer.schema';
import { CoupleQuestionStats, CoupleQuestionStatsSchema } from '../../schemas/couple-question-stats.schema';
import { DailyQuestion, DailyQuestionSchema } from '../../schemas/daily-question.schema';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: Memory.name, schema: MemorySchema },
      { name: Album.name, schema: AlbumSchema },
      { name: GalleryPhoto.name, schema: GalleryPhotoSchema },
      { name: BucketListItem.name, schema: BucketListItemSchema },
      { name: ImportantDate.name, schema: ImportantDateSchema },
      { name: TimeCapsule.name, schema: TimeCapsuleSchema },
      { name: Poem.name, schema: PoemSchema },
      { name: Note.name, schema: NoteSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
      { name: CoupleQuestionStats.name, schema: CoupleQuestionStatsSchema },
      { name: DailyQuestion.name, schema: DailyQuestionSchema },
    ]),
    AuthModule,
    UploadModule,
    ActivityModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
