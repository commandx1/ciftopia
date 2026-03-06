import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import * as PDFDocument from 'pdfkit';
import axios from 'axios';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Memory, MemoryDocument } from '../../schemas/memory.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Story, StoryDocument } from '../../schemas/story.schema';
import { CreateMemoryDto } from './dto/memories.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { AppGateway } from '../events/events.gateway';
import { User } from '../../schemas/user.schema';

interface QueryParams {
  mood?: string;
  sortBy?: string;
  limit?: number;
  skip?: number;
  userId?: string;
  onlyFavorites?: string;
}

@Injectable()
export class MemoriesService {
  private openai: OpenAI;
  private gemini: GoogleGenAI | null = null;
  private readonly geminiModel: string;

  constructor(
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private configService: ConfigService,
    private appGateway: AppGateway,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey: apiKey || '' });
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey) {
      this.gemini = new GoogleGenAI({ apiKey: geminiKey });
      this.geminiModel =
        this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
    } else {
      this.geminiModel = 'gemini-2.0-flash';
    }
  }

  private async transformPhotos(memories: MemoryDocument | MemoryDocument[]) {
    const isArray = Array.isArray(memories);
    const memoryList = isArray ? memories : [memories];

    const transformed = await Promise.all(
      memoryList.map(async (memory) => {
        const memoryObj = memory.toObject ? memory.toObject() : memory;

        // Keep raw photo keys/objects for editing
        memoryObj.rawPhotos = memoryObj.photos || [];

        // Transform memory photos to pre-signed URLs
        if (memoryObj.photos && memoryObj.photos.length > 0) {
          memoryObj.photos = await Promise.all(
            memoryObj.photos.map(async (photo: any) => {
              // Handle both object and legacy string format
              const key = typeof photo === 'string' ? photo : photo.url;
              const presignedUrl =
                await this.uploadService.getPresignedUrl(key);

              if (typeof photo === 'string') {
                return presignedUrl;
              }

              return {
                ...photo,
                url: presignedUrl,
              };
            }),
          );
        }

        // Transform author avatar if populated
        if (memoryObj.authorId) {
          await this.uploadService.transformAvatar(memoryObj.authorId);
        }

        // Üretilen şarkı varsa presigned URL ekle
        if (memoryObj.generatedSongKey) {
          memoryObj.generatedSongUrl = await this.uploadService.getPresignedUrl(
            memoryObj.generatedSongKey,
          );
        }

        return memoryObj;
      }),
    );

    return isArray ? transformed : transformed[0];
  }

  async findAllByCoupleId(coupleId: string, query: QueryParams) {
    const filter: Record<string, any> = {
      coupleId: new Types.ObjectId(coupleId),
    };
    if (query.mood && query.mood !== 'all') {
      filter.mood = query.mood;
    }

    if (query.onlyFavorites === 'true' && query.userId) {
      filter.favorites = new Types.ObjectId(query.userId);
    }

    // Prepare sort object
    const sort: Record<string, SortOrder> = {};
    if (query.sortBy === 'oldest') {
      sort.date = 1;
    } else if (query.sortBy === 'alphabetical') {
      sort.title = 1;
    } else {
      sort.date = -1; // newest
    }

    const limit = query.limit || 5;
    const skip = query.skip || 0;

    const memories = await this.memoryModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'firstName lastName avatar')
      .exec();

    // Stats calculations (applying current mood filter if any)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalCount, thisMonthCount, favoriteCount, couple] =
      await Promise.all([
        this.memoryModel.countDocuments(filter),
        this.memoryModel.countDocuments({
          ...filter,
          date: { $gte: startOfMonth },
        }),
        this.memoryModel.countDocuments({
          ...filter,
          favorites: query.userId
            ? new Types.ObjectId(query.userId)
            : undefined,
        }),
        this.coupleModel.findById(coupleId),
      ]);

    const transformedMemories = (await this.transformPhotos(memories)) as any[];

    return {
      memories: transformedMemories,
      stats: {
        total: totalCount,
        thisMonth: thisMonthCount,
        favorites: favoriteCount,
      },
      storageUsed: couple?.storageUsed || 0,
      storageLimit: couple?.storageLimit || 0,
      hasMore: totalCount > skip + limit,
    };
  }

  /** Çifte ait anıları content olmadan listeler (hikaye seçimi için). */
  async findForStoryList(coupleId: string) {
    const memories = await this.memoryModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .sort({ date: 1 })
      .select('-content')
      .populate('authorId', 'firstName lastName')
      .exec();

    const transformed = await this.transformPhotos(memories);
    return {
      memories: Array.isArray(transformed) ? transformed : [transformed],
    };
  }

  /** Tek bir hikayeyi döndürür (çifte ait olmalı). audioUrl presigned olarak eklenir. */
  async getStory(userId: string, storyId: string) {
    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });
    if (!couple) throw new NotFoundException('Çift hesabı bulunamadı.');
    const story = await this.storyModel.findOne({
      _id: new Types.ObjectId(storyId),
      coupleId: couple._id,
    });
    if (!story) throw new NotFoundException('Hikâye bulunamadı.');
    const audioUrl = story.audioKey
      ? await this.uploadService.getPresignedUrl(story.audioKey)
      : undefined;
    return {
      _id: story._id.toString(),
      content: story.content,
      date: story.date,
      audioUrl,
    };
  }

  async create(userId: string, createMemoryDto: CreateMemoryDto) {
    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });

    if (!couple) {
      throw new NotFoundException('Çift hesabı bulunamadı.');
    }

    const memory = new this.memoryModel({
      ...createMemoryDto,
      coupleId: couple._id,
      authorId: new Types.ObjectId(userId),
      date: new Date(createMemoryDto.date),
      location: createMemoryDto.locationName
        ? { name: createMemoryDto.locationName }
        : undefined,
      favorites: createMemoryDto.favorites
        ? createMemoryDto.favorites.map((id) => new Types.ObjectId(id))
        : [],
    });

    const savedMemory = await memory.save();
    const populated = await savedMemory.populate(
      'authorId',
      'firstName lastName avatar',
    );

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: couple._id.toString(),
      module: 'memories',
      actionType: 'create',
      resourceId: populated._id.toString(),
      description: `${user?.firstName || 'Biri'} "${populated.title}" isimli yeni bir anı ekledi.`,
      metadata: { title: populated.title },
    });

    // Send notification to partner
    this.notificationService.sendToPartner(
      userId,
      'Yeni Bir Anı! 📸',
      `${user?.firstName} yeni bir anı paylaştı: "${populated.title}"`,
      { screen: 'memories' },
    );

    // Fetch updated storage for the couple
    const updatedCouple = await this.coupleModel.findById(couple._id);

    return {
      ...(await this.transformPhotos(populated)),
      storageUsed: updatedCouple?.storageUsed,
    };
  }

  async update(
    userId: string,
    memoryId: string,
    updateMemoryDto: Partial<CreateMemoryDto>,
  ) {
    const memory = await this.memoryModel.findById(memoryId);
    if (!memory) {
      throw new NotFoundException('Anı bulunamadı.');
    }

    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });

    if (!couple || memory.coupleId.toString() !== couple._id.toString()) {
      throw new NotFoundException('Bu anıyı güncelleme yetkiniz yok.');
    }

    // Update fields
    if (updateMemoryDto.title) memory.title = updateMemoryDto.title;
    if (updateMemoryDto.content) memory.content = updateMemoryDto.content;
    if (updateMemoryDto.date) memory.date = new Date(updateMemoryDto.date);
    if (updateMemoryDto.mood) memory.mood = updateMemoryDto.mood;

    if (updateMemoryDto.favorites) {
      memory.favorites = updateMemoryDto.favorites.map(
        (id) => new Types.ObjectId(id),
      );
    }

    if (updateMemoryDto.locationName !== undefined) {
      memory.location = updateMemoryDto.locationName
        ? { name: updateMemoryDto.locationName }
        : undefined;
    }

    if (updateMemoryDto.photos) {
      if (updateMemoryDto.photos.length > 0) {
        // Logic for updating photos: delete old ones that are no longer present
        const currentUrls = memory.photos.map((p: any) => p.url);
        const newUrls = updateMemoryDto.photos.map((p: any) => p.url);

        const removedPhotos = memory.photos.filter(
          (p) => !newUrls.includes(p.url),
        );

        if (removedPhotos.length > 0) {
          const removedSize = removedPhotos.reduce(
            (acc: number, p) => acc + (p.size || 0),
            0,
          );
          await Promise.all(
            removedPhotos.map((p) => this.uploadService.deleteFile(p.url)),
          );

          // Decrease storage used
          await this.coupleModel.findByIdAndUpdate(memory.coupleId, {
            $inc: { storageUsed: -removedSize },
          });
        }
        memory.photos = updateMemoryDto.photos;
      } else {
        const removedSize = memory.photos.reduce(
          (acc: number, p) => acc + (p.size || 0),
          0,
        );
        await Promise.all(
          memory.photos.map((p) => this.uploadService.deleteFile(p.url)),
        );

        // Decrease storage used
        await this.coupleModel.findByIdAndUpdate(memory.coupleId, {
          $inc: { storageUsed: -removedSize },
        });
        memory.photos = [];
      }
    }

    const updatedMemory = await memory.save();
    const populated = await updatedMemory.populate(
      'authorId',
      'firstName lastName avatar',
    );

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: memory.coupleId.toString(),
      module: 'memories',
      actionType: 'update',
      resourceId: memoryId,
      description: `${user?.firstName || 'Biri'} "${populated.title}" anısını güncelledi.`,
      metadata: { title: populated.title },
    });

    // Fetch updated storage for the couple
    const updatedCouple = await this.coupleModel.findById(memory.coupleId);

    return {
      ...(await this.transformPhotos(populated)),
      storageUsed: updatedCouple?.storageUsed,
    };
  }

  async toggleFavorite(userId: string, memoryId: string) {
    const memory = await this.memoryModel.findById(memoryId);
    if (!memory) {
      throw new NotFoundException('Anı bulunamadı.');
    }

    const userObjectId = new Types.ObjectId(userId);
    const index = memory.favorites.findIndex((id) => id.equals(userObjectId));

    if (index > -1) {
      memory.favorites.splice(index, 1);
    } else {
      memory.favorites.push(userObjectId);
    }

    await memory.save();

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: memory.coupleId.toString(),
      module: 'memories',
      actionType: 'favorite',
      resourceId: memoryId,
      description: `${user?.firstName || 'Biri'} "${memory.title}" anısını ${index === -1 ? 'favorilerine ekledi' : 'favorilerinden çıkardı'}.`,
      metadata: { title: memory.title, isFavorite: index === -1 },
    });

    return { isFavorite: index === -1 };
  }

  async exportAsPdf(coupleId: string): Promise<Buffer> {
    const couple = await this.coupleModel
      .findById(coupleId)
      .populate('partner1')
      .populate('partner2');

    if (!couple) {
      throw new NotFoundException('Çift bulunamadı.');
    }

    const memories = await this.memoryModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .sort({ date: -1 })
      .exec();

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new (PDFDocument as any)({
          margin: 50,
          size: 'A4',
          bufferPages: true,
          info: {
            Title: 'Anılarımız - Çiftopia',
            Author: 'Çiftopia',
          },
        });

        // ⭐ Türkçe destekli font ekle
        const fontPath = path.join(__dirname, '../../../src/assets/fonts');
        doc.registerFont(
          'IndieFlower',
          path.join(fontPath, 'IndieFlower-Regular.ttf'),
        );

        // Varsayılan font olarak ayarla
        doc.font('IndieFlower');

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: any) => reject(err));

        // Header - Bold font
        doc
          .font('IndieFlower')
          .fillColor('#E91E63')
          .fontSize(32)
          .text('Anı Kitabımız', { align: 'center' });

        const p1 = couple.partner1 as unknown as User;
        const p2 = couple.partner2 as unknown as User;
        doc
          .font('IndieFlower')
          .fillColor('#666666')
          .fontSize(16)
          .text(`${p1.firstName} & ${p2.firstName}`, { align: 'center' })
          .moveDown(2);

        // Memories loop
        for (const [index, memory] of memories.entries()) {
          if (index > 0) {
            doc.addPage();
          }

          const dateStr = new Date(memory.date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          const moodColors: Record<string, string> = {
            romantic: '#E91E63',
            fun: '#FFB300',
            emotional: '#3F51B5',
            adventure: '#4CAF50',
          };
          const moodColor = moodColors[memory.mood || ''] || '#666666';

          const moodLabels: Record<string, string> = {
            romantic: 'Romantik',
            fun: 'Eğlenceli',
            emotional: 'Duygusal',
            adventure: 'Macera',
          };

          // Title
          doc
            .font('IndieFlower')
            .fillColor('#333333')
            .fontSize(28)
            .text(memory.title, { underline: true });

          // Date & Mood
          doc
            .font('IndieFlower')
            .fontSize(12)
            .fillColor('#999999')
            .text(`${dateStr}  |  `, { continued: true })
            .fillColor(moodColor)
            .text(moodLabels[memory.mood || ''] || 'Anı');

          doc.moveDown(1);

          // Location
          if (memory.location?.name) {
            doc
              .font('IndieFlower')
              .fillColor('#666666')
              .fontSize(10)
              .text(`📍 ${memory.location.name}`);
            doc.moveDown(1);
          }

          // Image
          if (memory.photos && memory.photos.length > 0) {
            try {
              const photo = memory.photos[0];
              const photoUrl = typeof photo === 'string' ? photo : photo.url;
              const url = await this.uploadService.getPresignedUrl(photoUrl);
              const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 5000,
              });
              const imageBuffer = Buffer.from(response.data, 'binary');

              doc.image(imageBuffer, {
                fit: [350, 180],
                align: 'center',
              } as any);
              doc.moveDown(1);
            } catch (err) {
              console.warn('PDF resim yüklenemedi, atlanıyor');
            }
          }

          // Content
          doc
            .font('IndieFlower')
            .fillColor('#444444')
            .fontSize(14)
            .text(memory.content, {
              align: 'justify',
              lineGap: 5,
            } as any);

          doc.moveDown(2);
        }

        // Footer
        const range = doc.bufferedPageRange();
        for (let i = 0; i < range.count; i++) {
          doc.switchToPage(i);
          doc
            .font('IndieFlower')
            .fillColor('#cccccc')
            .fontSize(10)
            .text(
              `Sayfa ${i + 1} / ${range.count}  •  Çiftopia ile sevgiyle hazırlandı`,
              50,
              doc.page.height - 50,
              { align: 'center' },
            );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  private readonly SUNO_BASE = 'https://api.sunoapi.org';

  /** Gemini ile hikaye metni üretir (GEMINI_API_KEY varsa kullanılır). */
  private async generateNovelWithGemini(
    prompt: string,
  ): Promise<{ story: string; promptTokens: number; completionTokens: number }> {
    if (!this.gemini) throw new Error('Gemini client not configured');
    const response = await this.gemini.models.generateContent({
      model: this.geminiModel,
      contents: prompt,
      config: {
        maxOutputTokens: 4000,
        temperature: 0.9,
      },
    });
    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned empty content');
    const usage = (response as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number } })
      .usageMetadata;
    return {
      story: text,
      promptTokens: usage?.promptTokenCount ?? 0,
      completionTokens: usage?.candidatesTokenCount ?? 0,
    };
  }

  /** OpenAI ile hikaye metni üretir. */
  private async generateNovelWithOpenAI(
    prompt: string,
  ): Promise<{ story: string; promptTokens: number; completionTokens: number }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.9,
    });
    const story = response.choices[0]?.message?.content?.trim();
    if (!story) throw new Error('OpenAI returned empty content');
    return {
      story,
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
    };
  }

  async generateNovel(
    userId: string,
    memoryIds: string[],
  ): Promise<{ story: string; storyId: string }> {
    const couple = await this.coupleModel
      .findOne({
        $or: [
          { partner1: new Types.ObjectId(userId) },
          { partner2: new Types.ObjectId(userId) },
        ],
      })
      .populate('partner1 partner2');

    if (!couple) {
      throw new NotFoundException('Çift hesabı bulunamadı.');
    }

    const coupleIdStr = couple._id.toString();
    this.appGateway.emitToCouple(coupleIdStr, 'novel:started', {});

    const partner1 = couple.partner1 as unknown as User | undefined;
    const partner2 = couple.partner2 as unknown as User | undefined;
    const partner1Name = partner1 ? partner1.firstName.trim() : 'Biri';
    const partner2Name = partner2 ? partner2.firstName.trim() : 'Biri';

    const memoryFilter =
      memoryIds?.length > 0
        ? {
            _id: { $in: memoryIds.map((id) => new Types.ObjectId(id)) },
            coupleId: couple._id,
          }
        : { coupleId: couple._id };

    this.appGateway.emitToCouple(coupleIdStr, 'novel:step', { step: 1 });

    const memories = await this.memoryModel
      .find(memoryFilter)
      .sort({ date: 1 })
      .select('title content date mood authorId')
      .populate('authorId', 'firstName lastName')
      .exec();

    if (!memories.length) {
      this.appGateway.emitToCouple(coupleIdStr, 'novel:error', {
        message: 'Hikâyeye dönüştürülecek en az bir anı bulunmalı.',
      });
      throw new BadRequestException(
        'Hikâyeye dönüştürülecek en az bir anı bulunmalı.',
      );
    }

    const blocks = memories.map((m) => {
      const author = m.authorId as unknown as User | undefined;
      const authorName = author ? author.firstName.trim() : undefined;
      const dateStr = m.date
        ? new Date(m.date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : '';

      return [
        dateStr ? `Tarih: ${dateStr}` : '',
        authorName ? `Yazan: ${authorName}` : '',
        `Metin: ${m.content}`,
      ]
        .filter(Boolean)
        .join('\n');
    });

    const joined = blocks.join('\n\n---\n\n');
    /* const maxChars = 8000;
    const baseText =
      joined.length > maxChars ? joined.slice(0, maxChars) : joined; */

    const prompt =
      `Aşağıdaki günlük/anı kayıtlarını temel alarak ${partner1Name} ve ${partner2Name} hakkında 5 bölümlük bir aşk hikâyesi yaz.

Kurallar:
- Ana karakter isimleri olarak mümkün olduğunca sadece "${partner1Name}" ve "${partner2Name}" kullan. Yeni ana karakter isimleri uydurma.
- Her blokta belirtilen "Yazan" bilgisini dikkate al; sahneleri kimin bakış açısından ağırlıklı yazacağını buna göre seç.
- Hikâyenin planını, karakter listesini ve çatışmasını kendi içinde düşünebilirsin; ancak ÇIKTIDA bunları yazma.
- Çıktıda SADECE hikâyenin kendisi olsun; 5 bölümden oluşsun.
- Çıktıyı **markdown** formatında üret ve şu yapıyı kullan:
  - Her bölüm için ` +
      '```' +
      `## Bölüm N: Bölüm Başlığı` +
      '```' +
      ` şeklinde bir başlık yaz (N 1'den 5'e kadar).
  - Bölüm başlıklarından önce veya sonra "Plan", "Karakterler", "Çatışma" gibi ekstra başlıklar ekleme.
- Dil Türkçe olsun.
- Toplam uzunluk en az 1500 kelime olsun.

Anılar (her blok bir anıyı temsil eder):

${joined}`;

    try {
      this.appGateway.emitToCouple(coupleIdStr, 'novel:step', { step: 2 });

      let result: { story: string; promptTokens: number; completionTokens: number };
      if (this.gemini) {
        try {
          result = await this.generateNovelWithGemini(prompt);
        } catch (geminiErr) {
          result = await this.generateNovelWithOpenAI(prompt);
        }
      } else {
        result = await this.generateNovelWithOpenAI(prompt);
      }
      const { story, promptTokens, completionTokens } = result;

      if (!story) {
        this.appGateway.emitToCouple(coupleIdStr, 'novel:error', {
          message: 'Hikâye oluşturulurken beklenmeyen bir hata oluştu.',
        });
        throw new BadRequestException(
          'Hikâye oluşturulurken beklenmeyen bir hata oluştu.',
        );
      }

      this.appGateway.emitToCouple(coupleIdStr, 'novel:step', { step: 3 });
      const created = await this.storyModel.create({
        coupleId: couple._id,
        content: story,
        date: new Date(),
        textPromptTokens: promptTokens || undefined,
        textCompletionTokens: completionTokens || undefined,
      });
      const storyId = created._id.toString();
      await this.generateStoryTtsInBackground(storyId, story, coupleIdStr);

      this.appGateway.emitToCouple(coupleIdStr, 'novel:step', { step: 4 });
      this.appGateway.emitToCouple(coupleIdStr, 'novel:done', { story, storyId });
      await this.notificationService.sendToCouple(
        coupleIdStr,
        'Hikâyeniz hazır!',
        'Anılarınızdan hikâye oluşturuldu.',
        {
          screen: 'memories',
        },
      );

      return { story, storyId };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Hikâye oluşturulamadı.';
      this.appGateway.emitToCouple(coupleIdStr, 'novel:error', { message });
      throw new BadRequestException(message);
    }
  }

  /** TTS için metin: markdown temizlenir, en fazla 4096 karakter (OpenAI limit). */
  private stripForTts(text: string): string {
    const stripped = text
      .replace(/#{1,6}\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
    return stripped.slice(0, 4096);
  }

  /** Hikaye metnini gpt-4o-mini-tts ile seslendirir, S3'e yükler, story'yi günceller ve socket ile bildirir. */
  private async generateStoryTtsInBackground(
    storyId: string,
    content: string,
    coupleIdStr: string,
  ): Promise<void> {
    const textForTts = this.stripForTts(content);
    if (!textForTts) return;
    try {
      const response = await this.openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'coral',
        input: textForTts,
        instructions: 'Türkçe, sakin ve samimi bir tonla oku. Masal anlatır gibi.',
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      const key = `stories/${storyId}.mp3`;
      await this.uploadService.uploadBuffer(key, buffer, 'audio/mpeg');
      await this.storyModel.findByIdAndUpdate(storyId, {
        audioKey: key,
        ttsInputCharacters: textForTts.length,
      });
      const audioUrl = await this.uploadService.getPresignedUrl(key);
      this.appGateway.emitToCouple(coupleIdStr, 'novel:audio-ready', {
        storyId,
        audioUrl,
      });
    } catch {
      // TTS hatası sessizce yok sayılır; hikaye metni zaten mevcut
    }
  }

  /** Anı içeriğinden GPT-4o-mini ile şarkı sözü için en fazla 200 karakterlik prompt üretir. */
  private async buildLyricsPromptWithGpt(
    memory: MemoryDocument,
  ): Promise<string> {
    const content =
      `Başlık: ${memory.title}\n\nİçerik: ${(memory.content || '').trim()}`.slice(
        0,
        2000,
      );
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Sen bir şarkı sözü yazarlığı asistanısın. Verilen anı metnini analiz edip, bu anıdan şarkı sözü üretecek bir AI\'ya gönderilecek kısa bir "prompt" (talep) yaz. Prompt: duygu, tema, atmosfer ve ana imgeleri vurgulasın; Türkçe olsun; kesinlikle en fazla 200 karakter olsun. Sadece prompt metnini döndür, başka açıklama ekleme.',
          },
          { role: 'user', content },
        ],
        max_tokens: 150,
      });
      const text = response.choices[0]?.message?.content?.trim();
      if (text && text.length > 0) {
        return text.slice(0, 200);
      }
    } catch {
      // Hata durumunda fallback
    }
    return (
      `${memory.title}. ${(memory.content || '').trim()}`.slice(0, 200) ||
      memory.title
    );
  }

  /** 202 döner; şarkı üretimi arka planda yapılır, ilerleme socket ile gönderilir. */
  async generateSong(
    userId: string,
    memoryId: string,
  ): Promise<{ started: boolean; memoryId: string }> {
    const memory = await this.memoryModel.findById(memoryId);
    if (!memory) {
      throw new NotFoundException('Anı bulunamadı.');
    }

    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });

    if (!couple || memory.coupleId.toString() !== couple._id.toString()) {
      throw new NotFoundException('Bu anı için şarkı üretme yetkiniz yok.');
    }

    const apiKey = this.configService.get<string>('SUNO_API_KEY');
    if (!apiKey) {
      throw new BadRequestException('Müzik üretimi yapılandırılmamış.');
    }

    this.generateSongInBackground(
      userId,
      memoryId,
      couple._id.toString(),
      apiKey,
    ).catch(() => {});
    return { started: true, memoryId };
  }

  private async generateSongInBackground(
    userId: string,
    memoryId: string,
    coupleId: string,
    apiKey: string,
  ) {
    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    const emit = (stage: string, payload?: Record<string, unknown>) => {
      this.appGateway.emitToCouple(coupleId, 'song:progress', {
        memoryId,
        stage,
        ...payload,
      });
    };

    try {
      const memory = await this.memoryModel.findById(memoryId);
      if (!memory) return;

      emit('analyzing');

      const lyricsPrompt = await this.buildLyricsPromptWithGpt(memory);

      const lyricsRes = await axios.post<{
        code?: number;
        msg?: string;
        data?: { taskId?: string };
      }>(
        `${this.SUNO_BASE}/api/v1/lyrics`,
        {
          prompt: lyricsPrompt,
          callBackUrl: 'https://api.ciftopia.local/callback',
        },
        { headers, timeout: 15000 },
      );
      if (lyricsRes.data?.code !== 200 || !lyricsRes.data?.data?.taskId) {
        throw new Error(
          lyricsRes.data?.msg ?? 'Şarkı sözleri görevi oluşturulamadı.',
        );
      }
      const lyricsTaskId = lyricsRes.data.data.taskId;

      emit('lyrics');

      let lyricsText = '';
      for (let i = 0; i < 40; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const recordRes = await axios.get<{
          code?: number;
          data?: {
            status?: string;
            response?: { data?: Array<{ text?: string; status?: string }> };
          };
        }>(`${this.SUNO_BASE}/api/v1/lyrics/record-info`, {
          params: { taskId: lyricsTaskId },
          headers,
          timeout: 10000,
        });
        const status = recordRes.data?.data?.status;
        if (
          status === 'SUCCESS' &&
          recordRes.data?.data?.response?.data?.length
        ) {
          const first = recordRes.data.data.response.data.find(
            (d) => d.status === 'complete',
          );
          lyricsText =
            first?.text ?? recordRes.data.data.response.data[0]?.text ?? '';
          if (lyricsText) break;
        }
        if (
          status === 'CREATE_TASK_FAILED' ||
          status === 'GENERATE_LYRICS_FAILED' ||
          status === 'SENSITIVE_WORD_ERROR' ||
          status === 'CALLBACK_EXCEPTION'
        ) {
          Logger.error('Şarkı sözleri üretilemedi.', {
            status,
            lyricsTaskId,
            lyricsRes: lyricsRes.data,
          });
          throw new BadRequestException('Şarkı sözleri üretilemedi.');
        }
      }
      if (!lyricsText) {
        throw new BadRequestException('Şarkı sözleri zaman aşımına uğradı.');
      }

      memory.generatedLyrics = lyricsText;
      await memory.save();

      emit('melody');

      const genRes = await axios.post<{
        code?: number;
        msg?: string;
        data?: { taskId?: string };
      }>(
        `${this.SUNO_BASE}/api/v1/generate`,
        {
          customMode: true,
          instrumental: false,
          model: 'V4_5ALL',
          callBackUrl: 'https://api.ciftopia.local/callback',
          prompt: lyricsText.slice(0, 5000),
          style: 'romantic, emotional, soft, Turkish',
          title: memory.title.slice(0, 80),
        },
        { headers, timeout: 15000 },
      );
      if (genRes.data?.code !== 200 || !genRes.data?.data?.taskId) {
        throw new Error(genRes.data?.msg ?? 'Şarkı görevi oluşturulamadı.');
      }
      const songTaskId = genRes.data.data.taskId;

      let audioUrl: string | null = null;
      let songDurationSeconds: number | undefined;
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const songRecordRes = await axios.get<{
          code?: number;
          data?: {
            status?: string;
            response?: {
              sunoData?: Array<{ audioUrl?: string; duration?: number }>;
            };
          };
        }>(`${this.SUNO_BASE}/api/v1/generate/record-info`, {
          params: { taskId: songTaskId },
          headers,
          timeout: 10000,
        });
        const status = songRecordRes.data?.data?.status;
        const sunoData = songRecordRes.data?.data?.response?.sunoData;
        if (status === 'SUCCESS' && sunoData?.length) {
          const first = sunoData[0];
          audioUrl =
            first?.audioUrl ??
            (first as { audio_url?: string })?.audio_url ??
            null;
          if (audioUrl) {
            songDurationSeconds =
              typeof first?.duration === 'number' ? first.duration : undefined;
            break;
          }
        }
        if (
          status === 'CREATE_TASK_FAILED' ||
          status === 'GENERATE_AUDIO_FAILED' ||
          status === 'SENSITIVE_WORD_ERROR' ||
          status === 'CALLBACK_EXCEPTION'
        ) {
          throw new BadRequestException('Şarkı üretimi başarısız oldu.');
        }
      }

      if (!audioUrl) {
        throw new BadRequestException('Şarkı üretimi zaman aşımına uğradı.');
      }

      const audioResponse = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
      });
      const buffer = Buffer.from(audioResponse.data, 'binary');

      const key = `songs/${memoryId}-${Date.now()}.mp3`;
      await this.uploadService.uploadBuffer(key, buffer, 'audio/mpeg');

      const updatePayload: {
        generatedSongKey: string;
        generatedSongDurationSeconds?: number;
      } = {
        generatedSongKey: key,
      };
      if (typeof songDurationSeconds === 'number') {
        updatePayload.generatedSongDurationSeconds = songDurationSeconds;
      }
      const updated = await this.memoryModel.findByIdAndUpdate(
        memoryId,
        updatePayload,
        { new: true },
      );
      const generatedSongUrl = updated
        ? await this.uploadService.getPresignedUrl(key)
        : null;

      this.appGateway.emitToCouple(coupleId, 'song:complete', {
        memoryId,
        generatedSongUrl,
        generatedSongKey: key,
        generatedSongDurationSeconds: songDurationSeconds,
      });
      await this.notificationService.sendToCouple(
        coupleId,
        'Şarkınız hazır!',
        'Anınızın şarkısı oluşturuldu.',
        {
          screen: 'memories',
          memoryId,
        },
      );
    } catch (err) {
      this.appGateway.emitToCouple(coupleId, 'song:error', {
        memoryId,
        message:
          err instanceof Error ? err.message : 'Şarkı üretimi başarısız oldu.',
      });
    }
  }

  async delete(userId: string, memoryId: string) {
    const memory = await this.memoryModel.findById(memoryId);
    if (!memory) {
      throw new NotFoundException('Anı bulunamadı.');
    }

    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });

    if (!couple || memory.coupleId.toString() !== couple._id.toString()) {
      throw new NotFoundException('Bu anıyı silme yetkiniz yok.');
    }

    if (memory.photos && memory.photos.length > 0) {
      const totalSize = memory.photos.reduce(
        (acc: number, p) => acc + (p.size || 0),
        0,
      );

      await Promise.all(
        memory.photos.map((p) =>
          this.uploadService.deleteFile(typeof p === 'string' ? p : p.url),
        ),
      );

      // Decrease storage used
      await this.coupleModel.findByIdAndUpdate(memory.coupleId, {
        $inc: { storageUsed: -totalSize },
      });
    }

    const memoryTitle = memory.title;
    await this.memoryModel.findByIdAndDelete(memoryId);

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: couple._id.toString(),
      module: 'memories',
      actionType: 'delete',
      description: `${user?.firstName || 'Biri'} "${memoryTitle}" isimli anıyı sildi.`,
      metadata: { title: memoryTitle },
    });

    return { success: true };
  }
}
