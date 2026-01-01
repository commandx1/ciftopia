import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemoriesController } from './memories.controller';
import { MemoriesService } from './memories.service';
import { Memory, MemorySchema } from '../../schemas/memory.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Memory.name, schema: MemorySchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
    UploadModule,
  ],
  controllers: [MemoriesController],
  providers: [MemoriesService],
  exports: [MemoriesService],
})
export class MemoriesModule {}
