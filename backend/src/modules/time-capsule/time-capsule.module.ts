import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TimeCapsuleService } from './time-capsule.service'
import { TimeCapsuleController } from './time-capsule.controller'
import { TimeCapsule, TimeCapsuleSchema } from '../../schemas/time-capsule.schema'
import { Couple, CoupleSchema } from '../../schemas/couple.schema'
import { UploadModule } from '../upload/upload.module'
import { ActivityModule } from '../activity/activity.module'
import { SecurityModule } from '../security/security.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimeCapsule.name, schema: TimeCapsuleSchema },
      { name: Couple.name, schema: CoupleSchema }
    ]),
    UploadModule,
    ActivityModule,
    SecurityModule
  ],
  controllers: [TimeCapsuleController],
  providers: [TimeCapsuleService]
})
export class TimeCapsuleModule {}
