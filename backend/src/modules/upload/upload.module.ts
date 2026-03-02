import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MediaConvertService } from './media-convert.service';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Couple.name, schema: CoupleSchema }]),
    PlanLimitsModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, MediaConvertService],
  exports: [UploadService, MediaConvertService],
})
export class UploadModule {}
