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
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PoemsService {
  constructor(
    @InjectModel(Poem.name) private poemModel: Model<PoemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private activityService: ActivityService,
    private notificationService: NotificationService,
  ) {}

  async findAllByCoupleId(
    coupleId: string,
    filters: { tag?: string; authorId?: string } = {},
    page: number = 1,
    limit: number = 9,
  ) {
    const query: Record<string, any> = { coupleId: new Types.ObjectId(coupleId) };
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
    const statsMatch: Record<string, any> = { coupleId: new Types.ObjectId(coupleId) };
    if (filters.tag) {
      statsMatch['tags'] = filters.tag;
    }

    const authorStats = await this.poemModel.aggregate([
      { $match: statsMatch },
      { $group: { _id: '$authorId', count: { $sum: 1 } } },
    ]);

    // Total count for the couple (considering tag filter but NOT authorId filter)
    const totalCount = await this.poemModel.countDocuments(statsMatch);

    // Total count for the current query (filtered by author and tag)
    const totalFilteredCount = await this.poemModel.countDocuments(query);

    return {
      poems,
      totalCount,
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

  async getDistinctTags(coupleId: string) {
    const tags = await this.poemModel.distinct('tags', {
      coupleId: new Types.ObjectId(coupleId),
    });
    return tags;
  }

  async create(userId: string, createPoemDto: CreatePoemDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) {
      throw new ForbiddenException('Çift kaydı bulunamadı');
    }

    // partner1 veya partner2'den diğerini bul
    const partnerId = couple.partner1.toString() === userId.toString() 
      ? couple.partner2 
      : couple.partner1;

    const partner = partnerId ? await this.userModel.findById(partnerId) : null;

    const poem = new this.poemModel({
      ...createPoemDto,
      authorId: new Types.ObjectId(userId),
      dedicatedTo: partner ? new Types.ObjectId(partner._id.toString()) : undefined,
      coupleId: user.coupleId,
    });

    const savedPoem = await poem.save();

    await this.activityService.logActivity({
      userId,
      coupleId: user.coupleId.toString(),
      module: 'poems',
      actionType: 'create',
      resourceId: savedPoem._id.toString(),
      description: `${user.firstName} yeni bir şiir paylaştı: "${savedPoem.title}"`,
      metadata: { title: savedPoem.title },
    });

    // Send notification to partner
    this.notificationService.sendToPartner(
      userId,
      'Yeni Bir Şiir! ✍️',
      `${user.firstName} senin için yeni bir şiir paylaştı: "${savedPoem.title}"`,
      { screen: 'poems' },
    );

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

    const author = await this.userModel.findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: updatedPoem.coupleId.toString(),
      module: 'poems',
      actionType: 'update',
      resourceId: poemId,
      description: `${author?.firstName || 'Biri'} "${updatedPoem.title}" şiirini güncelledi.`,
      metadata: { title: updatedPoem.title },
    });

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
    if (!user || poem.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu şiiri silme yetkiniz yok');
    }

    const poemTitle = poem.title;
    const coupleId = poem.coupleId;
    await this.poemModel.findByIdAndDelete(poemId);

    const author = await this.userModel.findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: coupleId.toString(),
      module: 'poems',
      actionType: 'delete',
      description: `${author?.firstName || 'Biri'} "${poemTitle}" isimli şiiri sildi.`,
      metadata: { title: poemTitle },
    });

    return { success: true };
  }
}
