import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { Mood, MoodSchema } from '../../schemas/mood.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mood.name, schema: MoodSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SecurityModule,
  ],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
