import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CiftoController } from './cifto.controller';
import { CiftoService } from './cifto.service';
import {
  CiftoConversation,
  CiftoConversationSchema,
} from '../../schemas/cifto-conversation.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { Memory, MemorySchema } from '../../schemas/memory.schema';
import {
  DailyQuestion,
  DailyQuestionSchema,
} from '../../schemas/daily-question.schema';
import {
  QuestionAnswer,
  QuestionAnswerSchema,
} from '../../schemas/question-answer.schema';
import { QuizResult, QuizResultSchema } from '../../schemas/quiz-result.schema';
import { Mood, MoodSchema } from '../../schemas/mood.schema';
import { EventsModule } from '../events/events.module';
import { PlanLimitsModule } from '../plan-limits/plan-limits.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CiftoConversation.name, schema: CiftoConversationSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
      { name: Memory.name, schema: MemorySchema },
      { name: DailyQuestion.name, schema: DailyQuestionSchema },
      { name: QuestionAnswer.name, schema: QuestionAnswerSchema },
      { name: QuizResult.name, schema: QuizResultSchema },
      { name: Mood.name, schema: MoodSchema },
    ]),
    EventsModule,
    PlanLimitsModule,
  ],
  controllers: [CiftoController],
  providers: [CiftoService],
  exports: [CiftoService],
})
export class CiftoModule {}
