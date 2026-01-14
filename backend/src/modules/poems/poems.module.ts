import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoemsController } from './poems.controller';
import { PoemsService } from './poems.service';
import { Poem, PoemSchema } from '../../schemas/poem.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Poem.name, schema: PoemSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
  ],
  controllers: [PoemsController],
  providers: [PoemsService],
  exports: [PoemsService],
})
export class PoemsModule {}
