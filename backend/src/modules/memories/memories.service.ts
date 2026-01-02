import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import { Memory, MemoryDocument } from '../../schemas/memory.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateMemoryDto } from './dto/memories.dto';
import { UploadService } from '../upload/upload.service';

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
  ) {}

  private async transformPhotos(memories: MemoryDocument | MemoryDocument[]) {
    const isArray = Array.isArray(memories);
    const memoryList = isArray ? memories : [memories];

    const transformed = await Promise.all(
      memoryList.map(async (memory) => {
        const memoryObj = memory.toObject();

        // Keep raw photo keys for editing
        memoryObj.rawPhotos = memoryObj.photos || [];

        // Transform memory photos to pre-signed URLs
        if (memoryObj.photos && memoryObj.photos.length > 0) {
          memoryObj.photos = await Promise.all(
            memoryObj.photos.map((key: string) =>
              this.uploadService.getPresignedUrl(key),
            ),
          );
        }

        // Transform author avatar if populated
        if (memoryObj.authorId && (memoryObj.authorId as any).avatar) {
          (memoryObj.authorId as any).avatar = await this.uploadService.getPresignedUrl(
            (memoryObj.authorId as any).avatar,
          );
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
    return this.transformPhotos(savedMemory);
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
        const removedPhotos = memory.photos.filter(
          (p: string) => !updateMemoryDto.photos?.includes(p),
        );
        if (removedPhotos.length > 0) {
          await Promise.all(
            removedPhotos.map((key) => this.uploadService.deleteFile(key)),
          );
        }
        memory.photos = updateMemoryDto.photos;
      } else {
        await Promise.all(
          memory.photos.map((key) => this.uploadService.deleteFile(key)),
        );
        memory.photos = [];
      }
    }

    const updatedMemory = await memory.save();
    return this.transformPhotos(updatedMemory);
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
    return { isFavorite: index === -1 };
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
      await Promise.all(
        memory.photos.map((key) => this.uploadService.deleteFile(key)),
      );
    }

    await this.memoryModel.findByIdAndDelete(memoryId);

    return { success: true };
  }
}
