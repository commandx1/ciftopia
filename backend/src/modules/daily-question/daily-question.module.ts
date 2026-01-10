import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyQuestionService } from './daily-question.service';
import { DailyQuestionController } from './daily-question.controller';
import { DailyQuestion, DailyQuestionSchema } from '../../schemas/daily-question.schema';
import { QuestionAnswer, QuestionAnswerSchema } from '../../schemas/question-answer.schema';
import { CoupleQuestionStats, CoupleQuestionStatsSchema } from '../../schemas/couple-question-stats.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyQuestion.name, schema: DailyQuestionSchema },
      { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
      { name: CoupleQuestionStats.name, schema: CoupleQuestionStatsSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DailyQuestionController],
  providers: [DailyQuestionService],
  exports: [DailyQuestionService],
})
export class DailyQuestionModule {}
