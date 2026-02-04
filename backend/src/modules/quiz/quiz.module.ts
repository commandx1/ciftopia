import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizGateway } from './quiz.gateway';
import { QuizSession, QuizSessionSchema } from '../../schemas/quiz-session.schema';
import { Quiz, QuizSchema } from '../../schemas/quiz.schema';
import { QuizResult, QuizResultSchema } from '../../schemas/quiz-result.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizSession.name, schema: QuizSessionSchema },
      { name: Quiz.name, schema: QuizSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService, QuizGateway],
  exports: [QuizService],
})
export class QuizModule {}
