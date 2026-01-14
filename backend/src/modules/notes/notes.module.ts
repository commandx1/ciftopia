import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { Note, NoteSchema } from '../../schemas/note.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Note.name, schema: NoteSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
