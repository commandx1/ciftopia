import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CoupleKey, CoupleKeySchema } from '../../schemas/couple-key.schema';
import { EncryptionService } from './security.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: CoupleKey.name, schema: CoupleKeySchema },
    ]),
  ],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class SecurityModule {}
