import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MemoriesModule } from './modules/memories/memories.module';
import { UploadModule } from './modules/upload/upload.module';
import { PoemsModule } from './modules/poems/poems.module';
import { NotesModule } from './modules/notes/notes.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { DailyQuestionModule } from './modules/daily-question/daily-question.module';
import { BucketListModule } from './modules/bucket-list/bucket-list.module';
import { ImportantDatesModule } from './modules/important-dates/important-dates.module';
import { TimeCapsuleModule } from './modules/time-capsule/time-capsule.module';
import { ActivityModule } from './modules/activity/activity.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    OnboardingModule,
    PaymentModule,
    MemoriesModule,
    UploadModule,
    PoemsModule,
    NotesModule,
    GalleryModule,
    DailyQuestionModule,
    BucketListModule,
    ImportantDatesModule,
    TimeCapsuleModule,
    ActivityModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
