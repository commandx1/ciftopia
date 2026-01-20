import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Memory, MemorySchema } from '../../schemas/memory.schema';
import { GalleryPhoto, GalleryPhotoSchema } from '../../schemas/gallery-photo.schema';
import { Poem, PoemSchema } from '../../schemas/poem.schema';
import { Note, NoteSchema } from '../../schemas/note.schema';
import { Activity, ActivitySchema } from '../../schemas/activity.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Album, AlbumSchema } from '../../schemas/album.schema';
import { BucketListItem, BucketListItemSchema } from '../../schemas/bucket-list.schema';
import { ImportantDate, ImportantDateSchema } from '../../schemas/important-date.schema';
import { TimeCapsule, TimeCapsuleSchema } from '../../schemas/time-capsule.schema';
import { QuestionAnswer, QuestionAnswerSchema } from '../../schemas/question-answer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Couple.name, schema: CoupleSchema },
      { name: Memory.name, schema: MemorySchema },
      { name: GalleryPhoto.name, schema: GalleryPhotoSchema },
      { name: Poem.name, schema: PoemSchema },
      { name: Note.name, schema: NoteSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Album.name, schema: AlbumSchema },
      { name: BucketListItem.name, schema: BucketListItemSchema },
      { name: ImportantDate.name, schema: ImportantDateSchema },
      { name: TimeCapsule.name, schema: TimeCapsuleSchema },
      { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
