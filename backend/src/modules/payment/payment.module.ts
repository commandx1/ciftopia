import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthModule } from '../auth/auth.module';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    MongooseModule.forFeature([{ name: Couple.name, schema: CoupleSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

