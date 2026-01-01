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

        // Transform memory photos
        if (memoryObj.photos && memoryObj.photos.length > 0) {
          memoryObj.photos = await Promise.all(
            memoryObj.photos.map((key: string) =>
              this.uploadService.getPresignedUrl(key),
            ),
          );
        }

        // Transform author avatar if populated
        if (memoryObj.authorId && memoryObj.authorId.avatar) {
          memoryObj.authorId.avatar = await this.uploadService.getPresignedUrl(
            memoryObj.authorId.avatar,
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
      this.memoryModel.countDocuments({ ...filter, isFavorite: true }),
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
      isPrivate: createMemoryDto.isPrivate || false,
      isFavorite: createMemoryDto.isFavorite || false,
    });

    const savedMemory = await memory.save();
    return this.transformPhotos(savedMemory);
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
