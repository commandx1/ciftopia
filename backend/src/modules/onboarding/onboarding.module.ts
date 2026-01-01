import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Memory, MemorySchema } from '../../schemas/memory.schema';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: Memory.name, schema: MemorySchema },
    ]),
    AuthModule,
    UploadModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
