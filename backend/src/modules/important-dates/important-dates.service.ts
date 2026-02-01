import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImportantDate, ImportantDateDocument } from '../../schemas/important-date.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateImportantDateDto, UpdateImportantDateDto } from './dto/important-date.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ImportantDatesService {
  constructor(
    @InjectModel(ImportantDate.name) private importantDateModel: Model<ImportantDateDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
  ) {}

  async findAllByCoupleId(coupleId: string) {
    const dates = await this.importantDateModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ date: 1 });

    return Promise.all(dates.map(date => this.transformDate(date)));
  }

  async create(coupleId: string, userId: string, createDto: CreateImportantDateDto) {
    if (!userId) throw new BadRequestException('Kullanıcı bilgisi eksik');
    const couple = await this.coupleModel.findById(coupleId);
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    // Check storage limit if photo is provided
    if (createDto.photo?.size) {
      if (couple.storageUsed + createDto.photo.size > couple.storageLimit) {
        throw new BadRequestException('Depolama alanı yetersiz');
      }
      couple.storageUsed += createDto.photo.size;
      await couple.save();
    }

    const newDate = new this.importantDateModel({
      ...createDto,
      coupleId: new Types.ObjectId(coupleId),
      authorId: new Types.ObjectId(userId),
    });

    const saved = await newDate.save();
    const populated = await saved.populate('authorId', 'firstName lastName avatar gender');

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: couple._id.toString(),
      module: 'important-dates',
      actionType: 'create',
      resourceId: populated._id.toString(),
      description: `${user?.firstName || 'Biri'} yeni bir önemli tarih ekledi: "${populated.title}"`,
      metadata: { title: populated.title, date: populated.date },
    });

    // Send notification to partner
    this.notificationService.sendToPartner(
      userId,
      'Yeni Bir Tarih! 📅',
      `${user?.firstName} takvime yeni bir tarih ekledi: "${populated.title}"`,
      { screen: 'important-dates' },
    );

    const transformed = await this.transformDate(populated);
    return {
      date: transformed,
      storageUsed: couple.storageUsed,
      storageLimit: couple.storageLimit,
    };
  }

  async update(id: string, userId: string, updateDto: UpdateImportantDateDto) {
    const item = await this.importantDateModel.findById(id);
    if (!item) throw new NotFoundException('Tarih bulunamadı');

    if (item.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu tarihi düzenleme yetkiniz yok');
    }

    const couple = await this.coupleModel.findById(item.coupleId);
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    // Handle photo change and storage
    if (updateDto.photo && updateDto.photo.url !== item.photo?.url) {
      const oldSize = item.photo?.size || 0;
      const newSize = updateDto.photo.size || 0;

      if (couple.storageUsed - oldSize + newSize > couple.storageLimit) {
        throw new BadRequestException('Depolama alanı yetersiz');
      }

      couple.storageUsed = Math.max(0, couple.storageUsed - oldSize + newSize);
      await couple.save();
    }

    const cleanUpdateDto = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined)
    );

    item.set(cleanUpdateDto);
    const updated = await item.save();
    const populated = await updated.populate('authorId', 'firstName lastName avatar gender');

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: populated.coupleId.toString(),
      module: 'important-dates',
      actionType: 'update',
      resourceId: id,
      description: `${user?.firstName || 'Biri'} "${populated.title}" önemli tarihini güncelledi.`,
      metadata: { title: populated.title },
    });

    const transformed = await this.transformDate(populated);
    return {
      date: transformed,
      storageUsed: couple.storageUsed,
      storageLimit: couple.storageLimit,
    };
  }

  async delete(id: string, userId: string) {
    const item = await this.importantDateModel.findById(id);
    if (!item) throw new NotFoundException('Tarih bulunamadı');

    if (item.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu tarihi silme yetkiniz yok');
    }

    const couple = await this.coupleModel.findById(item.coupleId);

    // Update storage
    if (item.photo?.size && couple) {
      couple.storageUsed = Math.max(0, couple.storageUsed - item.photo.size);
      await couple.save();
    }

    const dateTitle = item.title;
    const coupleId = item.coupleId;
    await item.deleteOne();

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: coupleId.toString(),
      module: 'important-dates',
      actionType: 'delete',
      description: `${user?.firstName || 'Biri'} "${dateTitle}" tarihini sildi.`,
      metadata: { title: dateTitle },
    });

    return { success: true, storageUsed: couple?.storageUsed };
  }

  private async transformDate(date: any) {
    const dateObj = date.toObject ? date.toObject() : date;
    if (dateObj.photo?.url) {
      dateObj.photo.url = await this.uploadService.getPresignedUrl(dateObj.photo.url);
    }
    return dateObj;
  }
}
