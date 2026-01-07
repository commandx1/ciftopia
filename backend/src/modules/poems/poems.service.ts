import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Poem, PoemDocument } from '../../schemas/poem.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreatePoemDto } from './dto/poems.dto';

@Injectable()
export class PoemsService {
  constructor(
    @InjectModel(Poem.name) private poemModel: Model<PoemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
  ) {}

  async findAllBySubdomain(
    subdomain: string,
    filters: { tag?: string; authorId?: string } = {},
    page: number = 1,
    limit: number = 9,
  ) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) {
      throw new NotFoundException('Çift bulunamadı');
    }

    const query: Record<string, any> = { coupleId: couple._id };
    if (filters.tag) {
      query['tags'] = filters.tag;
    }
    if (filters.authorId) {
      query['authorId'] = new Types.ObjectId(filters.authorId);
    }

    const skip = (page - 1) * limit;

    const poems = await this.poemModel
      .find(query)
      .populate('authorId', 'firstName lastName avatar gender')
      .populate('dedicatedTo', 'firstName lastName avatar gender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    // Stats - Respect tag filter but not author filter for the tabs
    const statsMatch: Record<string, any> = { coupleId: couple._id };
    if (filters.tag) {
      statsMatch['tags'] = filters.tag;
    }

    const authorStats = await this.poemModel.aggregate([
      { $match: statsMatch },
      { $group: { _id: '$authorId', count: { $sum: 1 } } },
    ]);

    // Total count for the subdomain (considering tag filter but NOT authorId filter)
    const totalSubdomainCount = await this.poemModel.countDocuments(statsMatch);

    // Total count for the current query (filtered by author and tag)
    const totalFilteredCount = await this.poemModel.countDocuments(query);

    return {
      poems,
      totalCount: totalSubdomainCount,
      authorStats,
      hasMore: totalFilteredCount > skip + poems.length,
    };
  }

  async findPublicPoems(page: number = 1, limit: number = 9) {
    const skip = (page - 1) * limit;

    const [poems, totalCount] = await Promise.all([
      this.poemModel
        .find({ isPublic: true })
        .populate('authorId', 'firstName lastName avatar gender')
        .populate('dedicatedTo', 'firstName lastName avatar gender')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.poemModel.countDocuments({ isPublic: true }),
    ]);

    return {
      poems,
      totalCount,
      hasMore: totalCount > skip + poems.length,
    };
  }

  async getDistinctTags(subdomain: string) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) {
      throw new NotFoundException('Çift bulunamadı');
    }

    const tags = await this.poemModel.distinct('tags', {
      coupleId: couple._id,
    });
    return tags;
  }

  async create(userId: string, createPoemDto: CreatePoemDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const partner = await this.userModel.findOne({
      coupleId: user.coupleId,
      _id: { $ne: userId },
    });

    const poem = new this.poemModel({
      ...createPoemDto,
      authorId: new Types.ObjectId(userId),
      dedicatedTo: partner ? new Types.ObjectId(partner._id) : undefined,
      coupleId: user.coupleId,
    });

    const savedPoem = await poem.save();
    return savedPoem.populate([
      { path: 'authorId', select: 'firstName lastName avatar gender' },
      { path: 'dedicatedTo', select: 'firstName lastName avatar gender' },
    ]);
  }

  async update(
    userId: string,
    poemId: string,
    updatePoemDto: Partial<CreatePoemDto>,
  ) {
    const poem = await this.poemModel.findById(poemId);
    if (!poem) {
      throw new NotFoundException('Şiir bulunamadı');
    }

    if (poem.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu şiiri düzenleme yetkiniz yok');
    }

    Object.assign(poem, updatePoemDto);
    const updatedPoem = await poem.save();
    return updatedPoem.populate([
      { path: 'authorId', select: 'firstName lastName avatar gender' },
      { path: 'dedicatedTo', select: 'firstName lastName avatar gender' },
    ]);
  }

  async delete(userId: string, poemId: string) {
    const poem = await this.poemModel.findById(poemId);
    if (!poem) {
      throw new NotFoundException('Şiir bulunamadı');
    }

    const user = await this.userModel.findById(userId);
    if (!user || poem.authorId.toString() !== userId) {
      throw new ForbiddenException('Bu şiiri silme yetkiniz yok');
    }

    await this.poemModel.findByIdAndDelete(poemId);
    return { success: true };
  }
}
