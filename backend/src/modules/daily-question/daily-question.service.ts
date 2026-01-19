import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import {
  DailyQuestion,
  DailyQuestionDocument,
} from '../../schemas/daily-question.schema';
import {
  QuestionAnswer,
  QuestionAnswerDocument,
} from '../../schemas/question-answer.schema';
import {
  CoupleQuestionStats,
  CoupleQuestionStatsDocument,
} from '../../schemas/couple-question-stats.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { AnswerQuestionDto } from './dto/daily-question.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class DailyQuestionService {
  private readonly logger = new Logger(DailyQuestionService.name);
  private openai: OpenAI;

  constructor(
    @InjectModel(DailyQuestion.name)
    private dailyQuestionModel: Model<DailyQuestionDocument>,
    @InjectModel(QuestionAnswer.name)
    private answerModel: Model<QuestionAnswerDocument>,
    @InjectModel(CoupleQuestionStats.name)
    private statsModel: Model<CoupleQuestionStatsDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
    private activityService: ActivityService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.error(
        'OPENAI_API_KEY is not defined in environment variables.',
      );
    }
    this.openai = new OpenAI({
      apiKey: apiKey || '',
    });
  }

  async generateForCouple(couple: CoupleDocument) {
    const partner1 = couple.partner1 as unknown as UserDocument;
    const partner2 = couple.partner2 as unknown as UserDocument;

    if (!partner1.relationshipProfile || !partner2.relationshipProfile) {
      this.logger.warn(
        `Couple ${couple._id.toString()} has missing relationship profiles. Skipping.`,
      );
      throw new BadRequestException(
        'İlişkinize en uygun soruları üretmek istiyoruz. Partnerinizin ilişki profili tamamlandıktan sonra sorularınızı görebilirsiniz.',
      );
    }

    const recentQuestions = await this.dailyQuestionModel
      .find({ coupleId: couple._id })
      .sort({ date: -1 })
      .limit(30)
      .select('question');

    const prompt = `Sen çiftler için Onedio tarzında, aşırı yaratıcı, eğlenceli ve merak uyandırıcı günlük sorular üreten bir asistansın.

# Görevin:
Çiftlerin birbirini daha iyi tanımasını sağlarken aynı zamanda eğlendiren, klişelerden uzak, sosyal medyada viral olabilecek kalitede sorular yazmak.

# Çift Profilleri:
Partner 1 (${partner1.firstName}):
- Çatışma Yaklaşımı: ${partner1.relationshipProfile.conflictStyle} (${partner1.relationshipProfile.conflictResponse})
- Duygusal Tetikleyici: ${partner1.relationshipProfile.emotionalTrigger}
- Karar Tarzı: ${partner1.relationshipProfile.decisionStyle}
- Sevgi Dili: ${partner1.relationshipProfile.loveLanguage}
- Temel İhtiyaçları: ${partner1.relationshipProfile.coreNeed.join(', ')}
- Hassas Alanları: ${partner1.relationshipProfile.sensitivityArea.join(', ')}

Partner 2 (${partner2.firstName}):
- Çatışma Yaklaşımı: ${partner2.relationshipProfile.conflictStyle} (${partner2.relationshipProfile.conflictResponse})
- Duygusal Tetikleyici: ${partner2.relationshipProfile.emotionalTrigger}
- Karar Tarzı: ${partner2.relationshipProfile.decisionStyle}
- Sevgi Dili: ${partner2.relationshipProfile.loveLanguage}
- Temel İhtiyaçları: ${partner2.relationshipProfile.coreNeed.join(', ')}
- Hassas Alanları: ${partner2.relationshipProfile.sensitivityArea.join(', ')}

# Kurallar:
1. ASLA resmi olma. "Neden özel?", "Hayatımızdaki yeri nedir?" gibi sıkıcı ve ödev gibi hissettiren kalıplar kullanma.
2. ONEDIO TARZI: "Farz et ki...", "Eğer ... olsaydı hangimiz ... yapardı?", "İtiraf et: ...", "Senin hakkında kimsenin bilmediği ama benim bildiğim o şey ne?" gibi sürükleyici girişler yap.
3. KATEGORİLER:
   - Deep: Ruhun derinliklerine iner ama bunu "Seninle en büyük korkum..." gibi çarpıcı sorar.
   - Fun: "Zombi istilası çıksa beni kime yem edersin?" gibi aşırı saçma ve eğlenceli.
   - Memory: "İlk buluşmamızda giydiğim o korkunç şeyi hatırlıyor musun?" gibi spesifik ve nostaljik.
   - Future: "Piyangodan 100 milyon çıksa ilk hangi şehre kaçarız?" gibi hayal kurdurucu.
   - Challenge: Birbirini tatlı tatlı zorlayan sorular.
4. Çiftin profiline (çatışma tarzı, hassas alanlar) dikkat et ama bunu profesyonel bir terapist gibi değil, en yakın arkadaşlarıymışsın gibi yansıt.
5. Son sorulanlara benzememeli: ${recentQuestions.map((q) => q.question).join(', ')}
6. Türkçe diline, esprilere ve samimiyete önem ver.

JSON formatında döndür:
{
  "question": "Soru metni buraya (Onedio başlığı gibi çarpıcı olsun)",
  "category": "deep|fun|memory|future|challenge",
  "emoji": "emoji buraya"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 250,
    });

    const contentString = response.choices[0].message.content;
    if (!contentString) {
      throw new Error('AI failed to generate a question');
    }

    const content = JSON.parse(contentString) as {
      question: string;
      category: 'deep' | 'fun' | 'memory' | 'future' | 'challenge';
      emoji: string;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.dailyQuestionModel.create({
      coupleId: couple._id,
      question: content.question,
      category: content.category,
      emoji: content.emoji,
      date: today,
    });
  }

  async getTodaysQuestion(userId: string, coupleId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let question = await this.dailyQuestionModel
      .findOne({
        coupleId: new Types.ObjectId(coupleId),
        date: today,
      })
      .populate({
        path: 'coupleId',
        populate: { path: 'partner1 partner2' },
      });

    // If no question generated yet (e.g. new couple or cron didn't run), generate one now
    if (!question) {
      const couple = await this.coupleModel
        .findById(coupleId)
        .populate('partner1 partner2');
      if (couple && couple.status === 'active') {
        await this.generateForCouple(couple);
        question = await this.dailyQuestionModel
          .findOne({
            coupleId: new Types.ObjectId(coupleId),
            date: today,
          })
          .populate({
            path: 'coupleId',
            populate: { path: 'partner1 partner2' },
          });
      }
    }

    if (!question) {
      throw new NotFoundException('Bugün için bir soru henüz oluşturulmadı.');
    }

    const userAnswer = await this.answerModel.findOne({
      questionId: question._id,
      userId: new Types.ObjectId(userId),
    });

    const partnerAnswer = await this.answerModel.findOne({
      questionId: question._id,
      userId: { $ne: new Types.ObjectId(userId) },
      coupleId: new Types.ObjectId(coupleId),
    });

    return {
      question,
      userAnswer,
      partnerAnswered: !!partnerAnswer,
      partnerAnswer: userAnswer ? partnerAnswer?.answer : null, // Lock: only show partner's answer if user has answered
    };
  }

  async answerQuestion(
    userId: string,
    coupleId: string,
    answerDto: AnswerQuestionDto,
  ) {
    const { questionId, answer } = answerDto;

    const existingAnswer = await this.answerModel.findOne({
      questionId: new Types.ObjectId(questionId),
      userId: new Types.ObjectId(userId),
    });

    if (existingAnswer) {
      throw new BadRequestException('Bu soruyu zaten cevapladınız.');
    }

    await this.answerModel.create({
      questionId: new Types.ObjectId(questionId),
      userId: new Types.ObjectId(userId),
      coupleId: new Types.ObjectId(coupleId),
      answer,
      answeredAt: new Date(),
    });

    await this.updateStreak(coupleId);

    const user = await this.userModel.findById(userId);
    const question = await this.dailyQuestionModel.findById(questionId);
    await this.activityService.logActivity({
      userId,
      coupleId,
      module: 'daily-question',
      actionType: 'answer',
      resourceId: questionId,
      description: `${user?.firstName || 'Biri'} günün sorusunu cevapladı: "${question?.question}"`,
      metadata: { question: question?.question },
    });

    // AI Analysis check - her iki taraf da cevap verdiyse analizi üret ve bekle
    const allAnswers = await this.answerModel.find({
      questionId: new Types.ObjectId(questionId),
      coupleId: new Types.ObjectId(coupleId),
    });

    if (allAnswers.length >= 2) {
      await this.generateAIAnalysis(questionId, coupleId);
    }

    // Güncel durumu (soru, cevaplar, analiz) döndür
    return this.getTodaysQuestion(userId, coupleId);
  }

  async generateAIAnalysis(questionId: string, coupleId: string) {
    const question = await this.dailyQuestionModel.findById(questionId);
    const answers = await this.answerModel
      .find({ questionId: new Types.ObjectId(questionId) })
      .populate('userId');
    const couple = await this.coupleModel
      .findById(coupleId)
      .populate('partner1 partner2');

    if (!question || answers.length < 2 || !couple) return;

    const partner1 = couple.partner1 as unknown as UserDocument;
    const partner2 = couple.partner2 as unknown as UserDocument;

    const ans1 = answers.find(
      (a) => a.userId['_id'].toString() === partner1._id.toString(),
    );
    const ans2 = answers.find(
      (a) => a.userId['_id'].toString() === partner2._id.toString(),
    );

    const prompt = `Sen çiftler için uzman bir ilişki danışmanısın. Aşağıdaki günün sorusuna çiftin verdiği cevapları analiz et.

Soru: ${question.question}
${partner1.firstName} adlı partnerin cevabı: "${ans1?.answer}"
${partner2.firstName} adlı partnerin cevabı: "${ans2?.answer}"

Kurallar:
1. Bu iki cevabı analiz et ve aralarındaki bağı güçlendirecek, ortak noktaları vurgulayacak veya farklılıkları nazikçe yorumlayacak samimi bir yorum yap.
2. Yorumun 5-10 cümle arasında olsun.
3. Dilin sıcak, yapıcı ve teşvik edici olsun.
4. "Siz" dili kullan (çifte hitap et).
5. Gereksiz teknik terimlerden kaçın, doğal bir sohbet havasında olsun.

Sadece yorum metnini döndür.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      const analysis = response.choices[0].message.content;
      if (analysis) {
        question.aiAnalysis = analysis;
        await question.save();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`OpenAI Analysis error: ${errorMessage}`);
    }
  }

  async getStats(coupleId: string) {
    let stats = await this.statsModel.findOne({
      coupleId: new Types.ObjectId(coupleId),
    });

    if (!stats) {
      stats = await this.statsModel.create({
        coupleId: new Types.ObjectId(coupleId),
      });
    }

    return stats;
  }

  async generateQuestionPdf(userId: string, coupleId: string): Promise<Buffer> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const question = await this.dailyQuestionModel
      .findOne({
        coupleId: new Types.ObjectId(coupleId),
        date: today,
      })
      .populate({
        path: 'coupleId',
        populate: { path: 'partner1 partner2' },
      });

    if (!question) {
      throw new NotFoundException('Bugünün sorusu bulunamadı.');
    }

    const answers = await this.answerModel
      .find({
        questionId: question._id,
        coupleId: new Types.ObjectId(coupleId),
      })
      .populate('userId');

    if (answers.length < 2) {
      throw new BadRequestException(
        'PDF oluşturmak için her iki partnerin de cevap vermesi gerekmektedir.',
      );
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 24,
        info: {
          Title: 'Günün Sorusu - Ciftopia',
          Author: 'Ciftopia AI',
        },
      });

      const fontPath = path.join(
        process.cwd(),
        'src/assets/fonts/IndieFlower-Regular.ttf',
      );
      const boldFontPath = path.join(
        process.cwd(),
        'src/assets/fonts/Roboto-Bold.ttf',
      );

      // Register fonts
      doc.registerFont('IndieFlower', fontPath);
      doc.registerFont('Roboto-Bold', boldFontPath);

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) =>
        reject(err instanceof Error ? err : new Error(String(err))),
      );

      // --- DECORATIVE BACKGROUND ELEMENTS ---
      // Top right circle
      doc.circle(550, 50, 100).fillOpacity(0.05).fill('#e11d48');
      // Bottom left circle
      doc.circle(50, 750, 120).fillOpacity(0.05).fill('#4f46e5');
      doc.fillOpacity(1); // Reset opacity

      // --- HEADER ---
      doc
        .fillColor('#e11d48')
        .font('IndieFlower')
        .fontSize(20)
        .text('Ciftopia', { align: 'center' });

      doc
        .fillColor('#6b7280')
        .font('IndieFlower')
        .fontSize(14)
        .text('Günün Sorusu & Değerli Hatırası', { align: 'center' })
        .moveDown(0.5);

      const dateStr = new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc
        .fillColor('#9ca3af')
        .font('Roboto-Bold')
        .fontSize(10)
        .text(dateStr.toUpperCase(), { align: 'center', characterSpacing: 2 })
        .moveDown(1.5);

      doc
        .strokeColor('#fecdd3') // rose-200
        .lineWidth(1)
        .moveTo(150, doc.y)
        .lineTo(445, doc.y)
        .stroke()
        .moveDown(2.5);

      // --- QUESTION SECTION ---
      const questionBoxY = doc.y;
      const questionText = `"${question.question}"`;

      // Calculate question height
      doc.font('IndieFlower').fontSize(10);
      const questionHeight = doc.heightOfString(questionText, {
        width: 450,
        lineGap: 5,
      });

      // Question Card
      doc
        .roundedRect(50, questionBoxY - 15, 495, questionHeight + 30, 20)
        .fill('#fff1f2'); // rose-50

      doc
        .fillColor('#e11d48')
        .font('Roboto-Bold')
        .text('BUGÜNÜN SORUSU', 70, questionBoxY - 5, {
          characterSpacing: 1.5,
        });

      doc
        .fillColor('#111827')
        .font('IndieFlower')
        .text(questionText, 70, questionBoxY + 15, {
          width: 450,
          lineGap: 5,
          align: 'center',
        });

      doc.y = questionBoxY + questionHeight + 30; // Move down after question

      // --- ANSWERS SECTION ---
      doc
        .fillColor('#374151')
        .font('Roboto-Bold')
        .text('CEVAPLARINIZ', 50, doc.y, { characterSpacing: 1 })
        .moveDown(1);

      answers.forEach((ans, index) => {
        const user = ans.userId as unknown as UserDocument;
        const isMale = user.gender === 'male';
        const accentColor = isMale ? '#4f46e5' : '#e11d48';
        const bgColor = isMale ? '#f5f3ff' : '#fff1f2';

        const currentY = doc.y;
        doc.font('IndieFlower');
        const ansHeight = doc.heightOfString(`"${ans.answer}"`, {
          width: 430,
          lineGap: 3,
        });

        // Answer Card
        doc
          .roundedRect(50, currentY - 5, 495, ansHeight + 35, 15)
          .fill(bgColor);

        // Side indicator line
        doc.rect(50, currentY - 5, 5, ansHeight + 35).fill(accentColor);

        doc
          .fillColor(accentColor)
          .font('Roboto-Bold')
          .text(user.firstName.toUpperCase(), 70, currentY + 2);

        doc
          .fillColor('#1f2937')
          .font('IndieFlower')
          .text(`"${ans.answer}"`, 70, currentY + 18, {
            width: 430,
            lineGap: 3,
          });

        doc.y = currentY + ansHeight + (index === 1 ? 50 : 40); // Space between answers
      });

      // --- AI ANALYSIS SECTION ---
      if (question.aiAnalysis) {
        // Ensure analysis starts on a good spot or new page if needed
        if (doc.y > 600) doc.addPage();

        const analysisY = doc.y;
        const analysisHeight = doc.heightOfString(`"${question.aiAnalysis}"`, {
          width: 445,
          lineGap: 5,
        });

        // Analysis Card
        doc
          .roundedRect(50, analysisY, 495, analysisHeight + 60, 25)
          .fill('#f0fdf4'); // green-50

        doc
          .strokeColor('#bbf7d0') // green-200
          .lineWidth(1)
          .roundedRect(50, analysisY, 495, analysisHeight + 60, 25)
          .stroke();

        doc
          .fillColor('#166534') // green-800
          .font('Roboto-Bold')
          .text('AI İLİŞKİ DANIŞMANI YORUMU', 75, analysisY + 15, {
            characterSpacing: 1,
          });

        doc
          .fillColor('#1f2937')
          .font('IndieFlower')
          .text(`"${question.aiAnalysis}"`, 75, analysisY + 35, {
            width: 445,
            lineGap: 5,
            align: 'justify',
          });
      }

      doc.end();
    });
  }

  private async updateStreak(coupleId: string) {
    let stats = await this.statsModel.findOne({
      coupleId: new Types.ObjectId(coupleId),
    });
    if (!stats) {
      stats = new this.statsModel({ coupleId: new Types.ObjectId(coupleId) });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (stats.lastAnsweredDate) {
      const lastDate = new Date(stats.lastAnsweredDate);
      lastDate.setHours(0, 0, 0, 0);

      if (lastDate.getTime() === yesterday.getTime()) {
        stats.currentStreak += 1;
        stats.longestStreak = Math.max(
          stats.longestStreak,
          stats.currentStreak,
        );
      } else if (lastDate.getTime() < yesterday.getTime()) {
        stats.currentStreak = 1;
      }
      // If lastDate is today, streak doesn't increase but totalAnswered does
    } else {
      stats.currentStreak = 1;
      stats.longestStreak = 1;
    }

    stats.lastAnsweredDate = new Date();
    stats.totalAnswered += 1;

    await stats.save();
  }
}
