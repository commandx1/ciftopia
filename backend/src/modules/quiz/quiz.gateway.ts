import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuizService } from './quiz.service';
import { Logger } from '@nestjs/common';
import { QuizSessionDocument } from '../../schemas/quiz-session.schema';
import { QuizDocument } from '../../schemas/quiz.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'quiz',
})
export class QuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizGateway.name);

  constructor(private readonly quizService: QuizService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:quiz')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; userId: string },
  ) {
    const { sessionId, userId } = data;
    await client.join(sessionId);

    const session = await this.quizService.getSession(sessionId);

    const clients = await this.server.in(sessionId).fetchSockets();
    const participantCount = clients.length;

    this.server
      .to(sessionId)
      .emit('player:joined', { userId, participantCount });

    if (participantCount === 2 && session.status === 'waiting') {
      session.status = 'in_progress';
      session.startedAt = new Date();

      this.server.to(sessionId).emit('quiz:generating');

      setTimeout(async () => {
        try {
          await session.save();
          this.server.to(sessionId).emit('quiz:start', session);
          this.sendCurrentStep(sessionId, session);
        } catch (error) {
          this.logger.error('Error starting quiz', error);
        }
      }, 2000);
    } else {
      client.emit('quiz:state', session);
      if (session.status === 'in_progress') {
        this.sendCurrentStep(sessionId, session);
      }
    }
  }

  @SubscribeMessage('answer:submit')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      sessionId: string;
      userId: string;
      answer: string;
      type: 'self' | 'guess';
    },
  ) {
    const { sessionId, userId, answer, type } = data;
    
    // Atomik işlem için güncel session'ı çekelim
    let session = await this.quizService.getSession(sessionId);
    if (session.status === 'finished') return;

    const currentQData = session.questionsData[session.currentQuestionIndex];

    if (type === 'self') {
      currentQData.selfAnswers.set(userId, answer);
    } else {
      currentQData.guesses.set(userId, answer);
    }

    session.markModified('questionsData');
    await session.save();

    const partnerId = await this.getPartnerId(session, userId);
    const bothDone =
      type === 'self'
        ? currentQData.selfAnswers.has(userId) &&
          currentQData.selfAnswers.has(partnerId)
        : currentQData.guesses.has(userId) &&
          currentQData.guesses.has(partnerId);

    if (bothDone) {
      if (type === 'self') {
        this.server.to(sessionId).emit('step:guessing_start');
        this.sendCurrentStep(sessionId, session, 'guess');
      } else {
        // Round complete - RE-CALCULATE ALL SCORES (Fix for Bug 1)
        const couple = await this.quizService.getCouple(session.coupleId.toString());
        const p1Id = couple.partner1.toString();
        const p2Id = couple.partner2.toString();

        const newScores = new Map<string, number>();
        newScores.set(p1Id, 0);
        newScores.set(p2Id, 0);

        // O ana kadar olan tüm soruları tara
        for (let i = 0; i <= session.currentQuestionIndex; i++) {
          const q = session.questionsData[i];
          if (q.guesses.get(p1Id) === q.selfAnswers.get(p2Id)) {
            newScores.set(p1Id, (newScores.get(p1Id) || 0) + 1);
          }
          if (q.guesses.get(p2Id) === q.selfAnswers.get(p1Id)) {
            newScores.set(p2Id, (newScores.get(p2Id) || 0) + 1);
          }
        }

        session.scores = newScores;
        session.markModified('scores');
        await session.save();

        this.server.to(sessionId).emit('question:result', {
          scores: Object.fromEntries(session.scores),
        });

        // Delay move to next or finish
        setTimeout(async () => {
          try {
            // Fetch fresh to avoid race in multi-device
            session = await this.quizService.getSession(sessionId);
            if (session.status === 'finished') return;

            const quiz = session.quizId as unknown as QuizDocument;

            if (session.currentQuestionIndex < quiz.questions.length - 1) {
              session.currentQuestionIndex += 1;
              await session.save();
              this.sendCurrentStep(sessionId, session, 'self');
            } else {
              session.status = 'finished';
              session.finishedAt = new Date();
              await session.save();

              // Save to results collection (Fix for Bug 2)
              await this.quizService.saveResult(session);
              
              this.server.to(sessionId).emit('quiz:finished', session);
            }
          } catch (error) {
            this.logger.error('Error updating quiz step', error);
          }
        }, 3000);
      }
    } else {
      this.server.to(sessionId).emit('player:ready', { userId, type });
    }
  }

  private async getPartnerId(
    session: QuizSessionDocument,
    userId: string,
  ): Promise<string> {
    const couple = await this.quizService.getCouple(
      session.coupleId.toString(),
    );
    return couple.partner1.toString() === userId
      ? couple.partner2.toString()
      : couple.partner1.toString();
  }

  private sendCurrentStep(
    sessionId: string,
    session: QuizSessionDocument,
    type: 'self' | 'guess' = 'self',
  ) {
    const quiz = session.quizId as unknown as QuizDocument;
    
    if (!quiz || !quiz.questions) {
      this.logger.error(`Quiz data not found for session: ${sessionId}`);
      return;
    }

    const currentQ = quiz.questions[session.currentQuestionIndex];
    if (!currentQ) return;

    this.server.to(sessionId).emit('question:new', {
      questionIndex: session.currentQuestionIndex,
      questionText: currentQ.questionText,
      options: currentQ.options,
      type: type,
    });
  }
}
