import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import {
  CiftoConversation,
  CiftoConversationDocument,
  CiftoMessage,
} from '../../schemas/cifto-conversation.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Memory, MemoryDocument } from '../../schemas/memory.schema';
import {
  DailyQuestion,
  DailyQuestionDocument,
} from '../../schemas/daily-question.schema';
import {
  QuestionAnswer,
  QuestionAnswerDocument,
} from '../../schemas/question-answer.schema';
import {
  QuizResult,
  QuizResultDocument,
} from '../../schemas/quiz-result.schema';
import { Mood, MoodDocument } from '../../schemas/mood.schema';
import { AppGateway } from '../events/events.gateway';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';

@Injectable()
export class CiftoService {
  private readonly logger = new Logger(CiftoService.name);
  private openai: OpenAI;
  private readonly maxStoredMessages = 200;
  private readonly maxContextMessages = 20;

  constructor(
    @InjectModel(CiftoConversation.name)
    private conversationModel: Model<CiftoConversationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    @InjectModel(DailyQuestion.name)
    private dailyQuestionModel: Model<DailyQuestionDocument>,
    @InjectModel(QuestionAnswer.name)
    private questionAnswerModel: Model<QuestionAnswerDocument>,
    @InjectModel(QuizResult.name)
    private quizResultModel: Model<QuizResultDocument>,
    @InjectModel(Mood.name) private moodModel: Model<MoodDocument>,
    private configService: ConfigService,
    private appGateway: AppGateway,
    private planLimitsService: PlanLimitsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error(
        'OPENAI_API_KEY is not defined in environment variables.',
      );
    }
    this.openai = new OpenAI({ apiKey: apiKey || '' });
  }

  async getConversation(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    let conversation = await this.conversationModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        userId: user._id,
        coupleId: user.coupleId,
        messages: [],
      });
    }

    return conversation;
  }

  async sendMessage(userId: string, content: string) {
    const text = (content || '').trim();
    if (!text) throw new BadRequestException('Mesaj boş olamaz.');

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');

    let conversation = await this.conversationModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        userId: user._id,
        coupleId: user.coupleId,
        messages: [],
      });
    }

    const couple = user.coupleId
      ? await this.coupleModel.findById(user.coupleId)
      : null;
    const planCode = couple?.planCode || 'free';
    const limits = await this.planLimitsService.getLimits(planCode);
    const dailyLimit = limits.ciftoDailyMessages;
    if (typeof dailyLimit === 'number' && dailyLimit >= 0) {
      const { startOfToday, endOfToday } = this.getTodayRange();
      const count =
        conversation?.messages.filter(
          (msg) =>
            msg.role === 'user' &&
            msg.createdAt >= startOfToday &&
            msg.createdAt <= endOfToday,
        ).length || 0;
      if (count >= dailyLimit) {
        throw new BadRequestException(
          'Günlük Çifto mesaj limitine ulaştınız.',
        );
      }
    }

    const now = new Date();
    conversation.messages.push({
      role: 'user',
      content: text,
      createdAt: now,
    });
    conversation.lastMessageAt = now;

    this.trimMessages(conversation);
    await conversation.save();

    const streamId = new Types.ObjectId().toString();
    const systemPrompt = await this.buildSystemPrompt(user);
    const contextMessages = this.buildContextMessages(conversation.messages);

    void this.streamAssistantResponse({
      userId: user._id.toString(),
      conversationId: conversation._id.toString(),
      streamId,
      systemPrompt,
      contextMessages,
    });

    return { conversation, streamId };
  }

  private buildContextMessages(messages: CiftoMessage[]) {
    const recent = messages.slice(-this.maxContextMessages);
    return recent.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private async streamAssistantResponse({
    userId,
    conversationId,
    streamId,
    systemPrompt,
    contextMessages,
  }: {
    userId: string;
    conversationId: string;
    streamId: string;
    systemPrompt: string;
    contextMessages: { role: 'user' | 'assistant'; content: string }[];
  }) {
    let assistantText = '';
    let failed = false;

    try {
      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...contextMessages,
        ],
        max_tokens: 550,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (!delta) continue;
        assistantText += delta;
        this.appGateway.emitToUser(userId, 'cifto:chunk', {
          streamId,
          delta,
        });
      }
    } catch (error) {
      failed = true;
      this.logger.error('Cifto response generation failed', error as Error);
    }

    if (!assistantText.trim()) {
      assistantText =
        'Şu anda yanıt üretmekte zorlanıyorum. Birazdan tekrar dener misin?';
    }

    if (failed) {
      this.appGateway.emitToUser(userId, 'cifto:error', {
        streamId,
        message: assistantText,
      });
    }

    try {
      const conversation =
        await this.conversationModel.findById(conversationId);
      if (conversation) {
        conversation.messages.push({
          role: 'assistant',
          content: assistantText,
          createdAt: new Date(),
        });
        conversation.lastMessageAt = new Date();
        this.trimMessages(conversation);
        await conversation.save();
      }
    } catch (error) {
      this.logger.error('Cifto conversation save failed', error as Error);
    }

    this.appGateway.emitToUser(userId, 'cifto:done', {
      streamId,
      message: assistantText,
    });
  }

  private async buildSystemPrompt(user: UserDocument) {
    let couple: CoupleDocument | null = null;
    let partner: UserDocument | null = null;

    if (user.coupleId) {
      couple = await this.coupleModel
        .findById(user.coupleId)
        .populate('partner1')
        .populate('partner2');

      const partner1 = couple?.partner1 as unknown as UserDocument;
      const partner2 = couple?.partner2 as unknown as UserDocument;
      partner =
        partner1 && partner1._id?.toString() !== user._id.toString()
          ? partner1
          : partner2;
    }

    const partnerName = partner?.firstName || 'Partner';
    const userName = user.firstName || 'Kullanıcı';
    const status = couple?.relationshipStatus || 'dating';
    const started = couple?.relationshipStartDate
      ? `İlişki başlangıç tarihi: ${couple.relationshipStartDate.toISOString().split('T')[0]}.`
      : '';

    const safeJoin = (value?: string[]) =>
      Array.isArray(value) && value.length ? value.join(', ') : 'belirtilmedi';

    const userProfile = user.relationshipProfile
      ? `Kullanıcının profili: çatışma yaklaşımı ${user.relationshipProfile.conflictStyle} (${user.relationshipProfile.conflictResponse}), duygusal tetikleyici ${user.relationshipProfile.emotionalTrigger}, karar tarzı ${user.relationshipProfile.decisionStyle}, sevgi dili ${user.relationshipProfile.loveLanguage}, temel ihtiyaçlar ${safeJoin(user.relationshipProfile.coreNeed)}, hassas alanlar ${safeJoin(user.relationshipProfile.sensitivityArea)}.`
      : '';

    const partnerProfile = partner?.relationshipProfile
      ? `${partnerName} profili: çatışma yaklaşımı ${partner.relationshipProfile.conflictStyle} (${partner.relationshipProfile.conflictResponse}), duygusal tetikleyici ${partner.relationshipProfile.emotionalTrigger}, karar tarzı ${partner.relationshipProfile.decisionStyle}, sevgi dili ${partner.relationshipProfile.loveLanguage}, temel ihtiyaçlar ${safeJoin(partner.relationshipProfile.coreNeed)}, hassas alanlar ${safeJoin(partner.relationshipProfile.sensitivityArea)}.`
      : '';

    const coupleContext = await this.buildCoupleContext(
      couple?._id?.toString(),
      user,
      partner,
      userName,
      partnerName,
    );

    return `Senin adın Çifto. Türkçe konuşan, samimi ve yargılamayan bir ilişki asistanısın. Görevin, ${userName} ve ${partnerName} arasındaki ilişkiyi güçlendirmek ve iletişimi iyileştirmek. Sadece ilişkiyi iyiye götürmeye odaklan; konu dağıldığında nazikçe ilişki eksenine geri getir.

Tarz:
- Kısa, net paragraflar ve uygulanabilir öneriler ver.
- Taraf tutma; iki tarafın ihtiyacını dengeli ele al.
- Varsayım yapma; gerekirse açık uçlu sorular sor.
- Zorlayıcı, baskıcı, manipülatif yönlendirme yapma.
- Şiddet, taciz, güvenlik riski içeren durumlarda güvenliğe odaklan ve profesyonel destek öner.

Bağlam:
- İlişki durumu: ${status}.
${started}
${userProfile}
${partnerProfile}
${coupleContext}`.trim();
  }

  private trimMessages(conversation: CiftoConversationDocument) {
    if (conversation.messages.length <= this.maxStoredMessages) return;
    conversation.messages = conversation.messages.slice(
      -this.maxStoredMessages,
    );
  }

  private getTodayRange(): { startOfToday: Date; endOfToday: Date } {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { startOfToday, endOfToday };
  }

  private async buildCoupleContext(
    coupleId: string | undefined,
    user: UserDocument,
    partner: UserDocument | null,
    userName: string,
    partnerName: string,
  ) {
    if (!coupleId) return '';

    const coupleObjectId = new Types.ObjectId(coupleId);

    const memories = await this.memoryModel
      .find({ coupleId: coupleObjectId })
      .sort({ date: -1, createdAt: -1 })
      .limit(3)
      .select('title content date mood')
      .lean();

    const memoryLines =
      memories.length > 0
        ? memories.map((memory) => {
            const date = this.formatDate(memory.date);
            const mood = memory.mood ? ` (${memory.mood})` : '';
            return `- ${date}${mood} ${this.truncate(memory.title, 80)} — ${this.truncate(memory.content, 140)}`;
          })
        : ['- Kayıt yok.'];

    const recentQuestions = await this.dailyQuestionModel
      .find({ coupleId: coupleObjectId })
      .sort({ date: -1 })
      .limit(5)
      .select('question category emoji date')
      .lean();

    const questionIds = recentQuestions.map((q) => q._id);
    const answers = questionIds.length
      ? await this.questionAnswerModel
          .find({ coupleId: coupleObjectId, questionId: { $in: questionIds } })
          .populate('userId', 'firstName')
          .select('answer userId questionId answeredAt')
          .lean()
      : [];

    const answersByQuestion = new Map<
      string,
      { userName: string; answer: string }[]
    >();
    answers.forEach((answer) => {
      const key = answer.questionId.toString();
      const author = answer.userId as unknown as { firstName?: string };
      const list = answersByQuestion.get(key) || [];
      list.push({
        userName: author?.firstName || 'Kullanıcı',
        answer: answer.answer,
      });
      answersByQuestion.set(key, list);
    });

    const questionLines =
      recentQuestions.length > 0
        ? recentQuestions.map((question) => {
            const date = this.formatDate(question.date);
            const answersForQuestion =
              answersByQuestion.get(question._id.toString()) || [];
            const answerText =
              answersForQuestion.length > 0
                ? answersForQuestion
                    .slice(0, 2)
                    .map(
                      (item) =>
                        `${item.userName}: "${this.truncate(item.answer, 120)}"`,
                    )
                    .join(' | ')
                : 'Henüz cevap yok.';
            return `- ${date} ${question.emoji} ${this.truncate(question.question, 160)} (${question.category}) | ${answerText}`;
          })
        : ['- Kayıt yok.'];

    const { startDate: moodStart, endDate: moodEnd } =
      this.getLastNDaysRange(3);
    const moodEntries = await this.moodModel
      .find({
        coupleId: coupleObjectId,
        date: { $gte: moodStart, $lte: moodEnd },
      })
      .sort({ date: -1 })
      .select('emoji note userId date')
      .lean();

    const userMoodLines = this.buildMoodLines(
      moodEntries,
      user._id.toString(),
      userName,
    );
    const partnerMoodLines = partner?._id
      ? this.buildMoodLines(
          moodEntries,
          partner._id.toString(),
          partnerName,
        )
      : ['- Kayıt yok.'];

    const quizResults = (await this.quizResultModel
      .find({ coupleId: coupleObjectId })
      .sort({ finishedAt: -1, createdAt: -1 })
      .limit(3)
      .select('category scores finishedAt createdAt')
      .lean()) as (QuizResultDocument & { createdAt?: Date })[];

    const quizLines =
      quizResults.length > 0
        ? quizResults.map((result) => {
            const date = this.formatDate(result.finishedAt || result.createdAt);
            const scores = this.extractScores(result.scores);
            const userScore = scores.get(user._id.toString());
            const partnerScore = partner?._id
              ? scores.get(partner._id.toString())
              : undefined;
            const scoreLine = `${userName}: ${userScore ?? '-'} | ${partnerName}: ${partnerScore ?? '-'}`;
            return `- ${date} ${result.category || 'quiz'} | Skor: ${scoreLine}`;
          })
        : ['- Kayıt yok.'];

    return [
      'İlişki belleği (son 3 anı):',
      ...memoryLines,
      'Ruh hali (son 3 gün):',
      `${userName}:`,
      ...userMoodLines,
      `${partnerName}:`,
      ...partnerMoodLines,
      'Günlük sorular (son 5):',
      ...questionLines,
      'Quiz sonuçları (son 3):',
      ...quizLines,
    ].join('\n');
  }

  private truncate(value: string | undefined, maxLength: number) {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1).trim()}…`;
  }

  private formatDate(value?: Date) {
    if (!value) return '';
    return value.toISOString().split('T')[0];
  }

  private getLastNDaysRange(days: number): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setUTCHours(23, 59, 59, 999);
    const startDate = new Date(now);
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    return { startDate, endDate };
  }

  private buildMoodLines(
    moods: Array<{ emoji?: string; note?: string; userId: Types.ObjectId; date: Date }>,
    targetUserId: string,
    label: string,
  ) {
    const filtered = moods.filter(
      (m) => m.userId?.toString() === targetUserId,
    );
    if (filtered.length === 0) return ['- Kayıt yok.'];

    return filtered.map((mood) => {
      const date = this.formatDate(mood.date);
      const note = mood.note ? ` — ${this.truncate(mood.note, 120)}` : '';
      return `- ${date} ${mood.emoji || ''}${note}`;
    });
  }

  private extractScores(scores: QuizResultDocument['scores']) {
    const map = new Map<string, number>();
    if (!scores) return map;
    if (scores instanceof Map) {
      scores.forEach((val, key) => map.set(key, val));
      return map;
    }
    Object.entries(scores as Record<string, number>).forEach(([key, val]) =>
      map.set(key, val),
    );
    return map;
  }
}
