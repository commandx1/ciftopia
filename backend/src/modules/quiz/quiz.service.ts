import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import {
  QuizSession,
  QuizSessionDocument,
} from '../../schemas/quiz-session.schema';
import { Quiz, QuizDocument } from '../../schemas/quiz.schema';
import {
  QuizResult,
  QuizResultDocument,
} from '../../schemas/quiz-result.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private openai: OpenAI;

  constructor(
    @InjectModel(QuizSession.name)
    private quizSessionModel: Model<QuizSessionDocument>,
    @InjectModel(Quiz.name)
    private quizModel: Model<QuizDocument>,
    @InjectModel(QuizResult.name)
    private quizResultModel: Model<QuizResultDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey: apiKey || '' });
  }

  async createSession(
    coupleId: string,
    category: string,
  ): Promise<QuizSessionDocument> {
    const couple = await this.coupleModel
      .findById(coupleId)
      .populate('partner1 partner2');
    if (!couple) throw new NotFoundException('Couple not found');

    // 1. Check for existing active session
    const activeSession = await this.quizSessionModel
      .findOne({
        coupleId: new Types.ObjectId(coupleId),
        status: { $in: ['waiting', 'in_progress'] },
      })
      .populate('quizId');

    if (activeSession) {
      return activeSession;
    }

    // 2. Check for an unused quiz in this category
    const solvedResults = await this.quizResultModel.find({
      coupleId: new Types.ObjectId(coupleId),
    }).select('quizId');
    
    const solvedQuizIds = solvedResults.map(r => r.quizId);

    let quiz = await this.quizModel.findOne({
      category,
      isActive: true,
      _id: { $nin: solvedQuizIds },
    });

    // 3. If no unused quiz found, generate a new one with AI
    if (!quiz) {
      const questions = await this.generateAIQuestions(category);
      quiz = await this.quizModel.create({
        category,
        questions,
      });
    }

    // 4. Initialize scores with user IDs
    const scores = new Map<string, number>();
    scores.set(couple.partner1._id.toString(), 0);
    if (couple.partner2) {
      scores.set(couple.partner2._id.toString(), 0);
    }

    // 5. Create new session
    const session = await this.quizSessionModel.create({
      coupleId: new Types.ObjectId(coupleId),
      quizId: quiz._id,
      category,
      status: 'waiting',
      scores,
      questionsData: [{}, {}, {}, {}, {}],
    });

    return session.populate('quizId');
  }

  private async generateAIQuestions(category: string) {
    const prompt = `You are generating quiz questions for a couple to test how well they know each other.
Category: ${category}

Rules:
- Generate exactly 5 questions.
- Use generic phrasing like "Partnerinizin en sevdiği ..." or "Partneriniz hangisini tercih eder?" or "Partneriniz bir ... hangisi gibi olurdu?" 
- Do NOT use specific names, use "partneriniz" or "eşiniz".
- Each question must have exactly 4 options.
- Keep it fun, light, and relationship-friendly.
- Language: Turkish.

Return a JSON object with a "questions" key containing an array of 5 objects:
{
  "questions": [
    { 
      "questionText": "En sevdiği hafta sonu aktivitesi nedir?", 
      "options": ["Film izlemek", "Yürüyüş", "Kitap okumak", "Gezmek"]
    }
  ]
}
The questions will be asked to BOTH partners about themselves first, then they will guess each other's answers.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      const contentString = response.choices[0].message.content;
      if (!contentString) {
        throw new Error('AI failed to generate content');
      }

      const content = JSON.parse(contentString);
      const questionsArray = (content.questions as any[]) || [];

      if (questionsArray.length === 0) {
        throw new Error('No questions found in AI response');
      }

      return questionsArray.slice(0, 5).map((q: any) => ({
        questionText: String(q.questionText),
        options: Array.isArray(q.options) ? q.options.map(String) : [],
      }));
    } catch (error) {
      this.logger.error('Error generating AI questions', error);
      return Array(5)
        .fill(null)
        .map((_, i) => ({
          questionText: `Örnek Soru ${i + 1}`,
          options: ['Seçenek 1', 'Seçenek 2', 'Seçenek 3', 'Seçenek 4'],
        }));
    }
  }

  async getSession(sessionId: string): Promise<QuizSessionDocument> {
    const session = await this.quizSessionModel
      .findById(sessionId)
      .populate('quizId');
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async getCouple(coupleId: string): Promise<CoupleDocument> {
    const couple = await this.coupleModel.findById(coupleId);
    if (!couple) throw new NotFoundException('Couple not found');
    return couple;
  }

  async getRecentSessions(coupleId: string): Promise<QuizResultDocument[]> {
    return this.quizResultModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .sort({ createdAt: -1 })
      .limit(5);
  }

  async getActiveSession(coupleId: string): Promise<QuizSessionDocument | null> {
    return this.quizSessionModel
      .findOne({
        coupleId: new Types.ObjectId(coupleId),
        status: { $in: ['waiting', 'in_progress'] },
      })
      .populate('quizId');
  }

  async saveResult(session: QuizSessionDocument): Promise<QuizResultDocument | null> {
    // Prevent duplicate saves for the same session
    const existing = await this.quizResultModel.findOne({ sessionId: session._id });
    if (existing) return existing;

    return this.quizResultModel.create({
      quizId: session.quizId,
      sessionId: session._id,
      coupleId: session.coupleId,
      scores: session.scores,
      category: session.category,
      details: session.questionsData,
      finishedAt: new Date(),
    });
  }

  async updateSession(
    sessionId: string,
    updateData: UpdateQuery<QuizSessionDocument>,
  ): Promise<QuizSessionDocument> {
    const session = await this.quizSessionModel
      .findByIdAndUpdate(sessionId, updateData, {
        new: true,
      })
      .exec();

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
