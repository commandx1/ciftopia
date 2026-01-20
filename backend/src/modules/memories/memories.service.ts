import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import * as PDFDocument from 'pdfkit';
import axios from 'axios';
import * as path from 'path';
import { Memory, MemoryDocument } from '../../schemas/memory.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateMemoryDto } from './dto/memories.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
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
  constructor(
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
  ) {}

  private async transformPhotos(memories: MemoryDocument | MemoryDocument[]) {
    const isArray = Array.isArray(memories);
    const memoryList = isArray ? memories : [memories];

    const transformed = await Promise.all(
      memoryList.map(async (memory) => {
        const memoryObj = memory.toObject ? memory.toObject() : memory;

        // Keep raw photo keys/objects for editing
        (memoryObj as any).rawPhotos = memoryObj.photos || [];

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

        return memoryObj;
      }),
    );

    return isArray ? transformed : transformed[0];
  }

  async findAllBySubdomain(subdomain: string, query: QueryParams) {
    const couple = await this.coupleModel.findOne({
      subdomain: subdomain.toLowerCase(),
    });
    if (!couple) {
      throw new NotFoundException('Çift bulunamadı.');
    }

    const filter: Record<string, any> = {
      coupleId: couple._id,
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

    const [totalCount, thisMonthCount, favoriteCount] = await Promise.all([
      this.memoryModel.countDocuments(filter),
      this.memoryModel.countDocuments({
        ...filter,
        date: { $gte: startOfMonth },
      }),
      this.memoryModel.countDocuments({
        ...filter,
        favorites: query.userId ? new Types.ObjectId(query.userId) : undefined,
      }),
    ]);

    const transformedMemories = (await this.transformPhotos(memories)) as any[];

    return {
      memories: transformedMemories,
      stats: {
        total: totalCount,
        thisMonth: thisMonthCount,
        favorites: favoriteCount,
      },
      hasMore: totalCount > skip + limit,
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
    const populated = await savedMemory.populate('authorId', 'firstName lastName avatar');

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

    // Fetch updated storage for the couple
    const updatedCouple = await this.coupleModel.findById(couple._id);

    return {
      ...((await this.transformPhotos(populated)) as any),
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
    const populated = await updatedMemory.populate('authorId', 'firstName lastName avatar');

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
      ...((await this.transformPhotos(populated)) as any),
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

  async exportAsPdf(subdomain: string): Promise<Buffer> {
    const couple = await this.coupleModel
      .findOne({ subdomain: subdomain.toLowerCase() })
      .populate('partner1')
      .populate('partner2');

    if (!couple) {
      throw new NotFoundException('Çift bulunamadı.');
    }

    const memories = await this.memoryModel
      .find({ coupleId: couple._id })
      .sort({ date: -1 })
      .exec();

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new (PDFDocument as any)({
          margin: 50,
          size: 'A4',
          bufferPages: true,
          info: {
            Title: `Anılarımız - ${subdomain}`,
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
