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
  private clientSessions = new Map<string, string>(); // clientId -> sessionId
  private cleanupTimers = new Map<string, NodeJS.Timeout>(); // sessionId -> timeout

  constructor(private readonly quizService: QuizService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const sessionId = this.clientSessions.get(client.id);
    if (!sessionId) return;

    this.clientSessions.delete(client.id);
    this.logger.log(`Client disconnected from session ${sessionId}: ${client.id}`);

    // Kısa bir gecikme ekleyelim ki socket odadan tamamen temizlensin
    setTimeout(async () => {
      // Odadaki mevcut socket sayısını güvenli bir şekilde kontrol et
      const adapter = this.server.adapter as any;
      const room = adapter.rooms?.get(sessionId);
      const remainingCount = room ? room.size : 0;
      
      this.logger.log(`Remaining participants in room ${sessionId}: ${remainingCount}`);

      // Eğer odada kimse kalmadıysa oturumu ANINDA iptal et
      if (remainingCount === 0) {
        try {
          const session = await this.quizService.getSession(sessionId);
          if (session && session.status !== 'finished' && session.status !== 'cancelled') {
            session.status = 'cancelled';
            await session.save();
            this.logger.log(`Session ${sessionId} cancelled successfully because everyone left.`);
          }
        } catch (error) {
          this.logger.error(`Error auto-cancelling session ${sessionId}`, error);
        }
      }
    }, 500);
  }

  @SubscribeMessage('join:quiz')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; userId: string },
  ) {
    const { sessionId, userId } = data;
    await client.join(sessionId);
    this.clientSessions.set(client.id, sessionId);
    (client as any).userId = userId;

    if (this.cleanupTimers.has(sessionId)) {
      clearTimeout(this.cleanupTimers.get(sessionId));
      this.cleanupTimers.delete(sessionId);
    }

    const session = await this.quizService.getSession(sessionId);
    const adapter = this.server.adapter as any;
    const room = adapter.rooms?.get(sessionId);
    const participantCount = room ? room.size : 0;

    this.server
      .to(sessionId)
      .emit('player:joined', { userId, participantCount });

    if (participantCount === 2 && session.status === 'waiting') {
      session.status = 'in_progress';
      session.currentStage = 'self';
      session.startedAt = new Date();
      
      const couple = await this.quizService.getCouple(session.coupleId.toString());
      session.userProgress.set(couple.partner1.toString(), 0);
      session.userProgress.set(couple.partner2.toString(), 0);

      this.server.to(sessionId).emit('quiz:generating');

      setTimeout(async () => {
        try {
          await session.save();
          this.server.to(sessionId).emit('quiz:start', session);
          
          const sockets = await this.server.in(sessionId).fetchSockets();
          for (const s of sockets) {
            const uId = (s as any).userId;
            this.sendUserCurrentStep(s as any, session, uId);
          }
        } catch (error) {
          this.logger.error('Error starting quiz', error);
        }
      }, 2000);
    } else {
      client.emit('quiz:state', session);
      if (session.status === 'in_progress') {
        this.sendUserCurrentStep(client, session, userId);
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
    
    let session = await this.quizService.getSession(sessionId);
    if (session.status === 'finished') return;

    const currentIndex = session.userProgress.get(userId) || 0;
    if (currentIndex === 999) return;

    const currentQData = session.questionsData[currentIndex];

    if (type === 'self') {
      currentQData.selfAnswers.set(userId, answer);
    } else {
      currentQData.guesses.set(userId, answer);
    }

    session.markModified('questionsData');

    const quiz = session.quizId as unknown as QuizDocument;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < quiz.questions.length) {
      session.userProgress.set(userId, nextIndex);
      session.markModified('userProgress');
      await session.save();
      this.sendUserCurrentStep(client, session, userId);
    } else {
      session.userProgress.set(userId, 999);
      session.markModified('userProgress');
      await session.save();

      const partnerId = await this.getPartnerId(session, userId);
      const partnerProgress = session.userProgress.get(partnerId);

      if (partnerProgress === 999) {
        if (session.currentStage === 'self') {
          session.currentStage = 'guess';
          session.userProgress.set(userId, 0);
          session.userProgress.set(partnerId, 0);
          session.markModified('userProgress');
          await session.save();
          
          this.server.to(sessionId).emit('stage:changed', { stage: 'guess' });
          
          const sockets = await this.server.in(sessionId).fetchSockets();
          for (const s of sockets) {
            const uId = (s as any).userId;
            this.sendUserCurrentStep(s as any, session, uId);
          }
        } else {
          const couple = await this.quizService.getCouple(session.coupleId.toString());
          const p1Id = couple.partner1.toString();
          const p2Id = couple.partner2.toString();
          const newScores = new Map<string, number>();
          newScores.set(p1Id, 0);
          newScores.set(p2Id, 0);

          for (const q of session.questionsData) {
            if (q.guesses.get(p1Id) === q.selfAnswers.get(p2Id)) {
              newScores.set(p1Id, (newScores.get(p1Id) || 0) + 1);
            }
            if (q.guesses.get(p2Id) === q.selfAnswers.get(p1Id)) {
              newScores.set(p2Id, (newScores.get(p2Id) || 0) + 1);
            }
          }

          session.scores = newScores;
          session.status = 'finished';
          session.finishedAt = new Date();
          session.markModified('scores');
          await session.save();
          await this.quizService.saveResult(session);
          
          this.server.to(sessionId).emit('quiz:finished', session);
        }
      } else {
        client.emit('player:waiting_partner', { stage: session.currentStage });
      }
    }
  }

  private sendUserCurrentStep(client: Socket, session: QuizSessionDocument, userId: string) {
    const quiz = session.quizId as unknown as QuizDocument;
    if (!quiz || !quiz.questions) return;

    const progress = session.userProgress.get(userId);
    if (progress === 999) return;

    const currentQ = quiz.questions[progress || 0];
    if (!currentQ) return;

    client.emit('question:new', {
      questionIndex: progress || 0,
      questionText: currentQ.questionText,
      options: currentQ.options,
      type: session.currentStage,
    });
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
}
