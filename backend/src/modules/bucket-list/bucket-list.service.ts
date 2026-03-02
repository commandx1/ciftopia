import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  BucketListItem,
  BucketListItemDocument,
} from '../../schemas/bucket-list.schema';
import {
  CreateBucketListItemDto,
  UpdateBucketListItemDto,
} from './dto/bucket-list.dto';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BucketListService {
  constructor(
    @InjectModel(BucketListItem.name)
    private bucketListItemModel: Model<BucketListItemDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private uploadService: UploadService,
  ) {}

  /** authorId ve completedBy avatar URL'lerini presigned yapar. */
  private async transformItemAvatars(item: any): Promise<void> {
    if (item?.authorId) await this.uploadService.transformAvatar(item.authorId);
    if (item?.completedBy && Array.isArray(item.completedBy)) {
      await Promise.all(item.completedBy.map((u: any) => this.uploadService.transformAvatar(u)));
    }
  }

  async findAllByCoupleId(coupleId: string) {
    const items = await this.bucketListItemModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .populate('completedBy', 'firstName lastName avatar gender')
      .sort({ isCompleted: 1, createdAt: -1 })
      .exec();
    await Promise.all(items.map((i) => this.transformItemAvatars(i)));
    return items;
  }

  async create(
    userId: string,
    coupleId: string,
    createDto: CreateBucketListItemDto,
  ) {
    const item = new this.bucketListItemModel({
      ...createDto,
      authorId: new Types.ObjectId(userId),
      coupleId: new Types.ObjectId(coupleId),
    });
    const savedItem = await item.save();

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: coupleId.toString(),
      module: 'bucket-list',
      actionType: 'create',
      resourceId: savedItem._id.toString(),
      description: `${user?.firstName || 'Biri'} hayaller listesine yeni bir madde ekledi: "${savedItem.title}"`,
      metadata: { title: savedItem.title },
    });

    // Send notification to partner
    this.notificationService.sendToPartner(
      userId,
      'Yeni Bir Hayal! ✨',
      `${user?.firstName || 'Partnerin'} hayaller listesine yeni bir madde ekledi: "${savedItem.title}"`,
      { screen: 'bucket-list' },
    );

    const populated = await savedItem.populate('authorId', 'firstName lastName avatar gender');
    await this.transformItemAvatars(populated);
    return populated;
  }

  async update(
    userId: string,
    itemId: string,
    updateDto: UpdateBucketListItemDto,
  ) {
    const item = await this.bucketListItemModel.findById(itemId);
    if (!item) throw new NotFoundException('Hayal bulunamadı');

    // Tamamlanma durumu değişiyorsa ilgili alanları güncelle
    if (updateDto.isCompleted !== undefined) {
      if (updateDto.isCompleted && !item.isCompleted) {
        item.isCompleted = true;
        item.completedAt = new Date();
        if (
          !item.completedBy.some((id) => id.toString() === userId.toString())
        ) {
          item.completedBy.push(new Types.ObjectId(userId));
        }
      } else if (updateDto.isCompleted === false) {
        item.isCompleted = false;
        item.completedAt = undefined;
        // completedBy listesinden kullanıcıyı çıkar (opsiyonel)
        item.completedBy = item.completedBy.filter(
          (id) => id.toString() !== userId.toString(),
        );
      }
    }

    // Sadece tanımlı (undefined olmayan) alanları güncelle
    const cleanUpdateDto = Object.fromEntries(
      Object.entries(updateDto).filter(([, value]) => value !== undefined),
    );
    item.set(cleanUpdateDto);

    const updatedItem = await item.save();

    const user = await this.coupleModel.db.model('User').findById(userId);
    if (updateDto.isCompleted !== undefined) {
      await this.activityService.logActivity({
        userId,
        coupleId: updatedItem.coupleId.toString(),
        module: 'bucket-list',
        actionType: 'update',
        resourceId: itemId,
        description: `${user?.firstName || 'Biri'} "${updatedItem.title}" hayalini ${updatedItem.isCompleted ? 'gerçekleştirdi! 🎉' : 'tamamlanmadı olarak işaretledi.'}`,
        metadata: { title: updatedItem.title, isCompleted: updatedItem.isCompleted },
      });
    } else {
      await this.activityService.logActivity({
        userId,
        coupleId: updatedItem.coupleId.toString(),
        module: 'bucket-list',
        actionType: 'update',
        resourceId: itemId,
        description: `${user?.firstName || 'Biri'} "${updatedItem.title}" hayalini güncelledi.`,
        metadata: { title: updatedItem.title },
      });
    }

    const populated = await updatedItem.populate([
      { path: 'authorId', select: 'firstName lastName avatar gender' },
      { path: 'completedBy', select: 'firstName lastName avatar gender' },
    ]);
    await this.transformItemAvatars(populated);
    return populated;
  }

  async delete(userId: string, itemId: string) {
    const item = await this.bucketListItemModel.findById(itemId);
    if (!item) throw new NotFoundException('Hayal bulunamadı');

    // Sadece yazan kişi silebilir kuralı eklenebilir veya partnerlerden herhangi biri
    // Biz şimdilik partnerlerden herhangi birine izin veriyoruz (CoupleOwnerGuard kontrolünde)

    const itemTitle = item.title;
    const coupleId = item.coupleId;
    await this.bucketListItemModel.findByIdAndDelete(itemId);

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: coupleId.toString(),
      module: 'bucket-list',
      actionType: 'delete',
      description: `${user?.firstName || 'Biri'} "${itemTitle}" hayalini sildi.`,
      metadata: { title: itemTitle },
    });

    return { success: true };
  }
}
