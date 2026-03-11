import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PoemsController } from './poems.controller';
import { PoemsService } from './poems.service';
import { Poem, PoemSchema } from '../../schemas/poem.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { ActivityModule } from '../activity/activity.module';
import { UploadModule } from '../upload/upload.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Poem.name, schema: PoemSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
    ActivityModule,
    UploadModule,
    SecurityModule,
  ],
  controllers: [PoemsController],
  providers: [PoemsService],
  exports: [PoemsService],
})
export class PoemsModule {}
