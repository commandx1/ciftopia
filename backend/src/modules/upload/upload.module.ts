import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Couple.name, schema: CoupleSchema }]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
