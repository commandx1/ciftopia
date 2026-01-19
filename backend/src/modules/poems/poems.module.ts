import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoemsController } from './poems.controller';
import { PoemsService } from './poems.service';
import { Poem, PoemSchema } from '../../schemas/poem.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Poem.name, schema: PoemSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
    ActivityModule,
  ],
  controllers: [PoemsController],
  providers: [PoemsService],
  exports: [PoemsService],
})
export class PoemsModule {}
