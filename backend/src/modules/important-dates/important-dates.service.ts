import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImportantDate, ImportantDateDocument } from '../../schemas/important-date.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateImportantDateDto, UpdateImportantDateDto } from './dto/important-date.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationService } from '../notification/notification.service';
import { EncryptionService } from '../security/security.service';

@Injectable()
export class ImportantDatesService {
  constructor(
    @InjectModel(ImportantDate.name) private importantDateModel: Model<ImportantDateDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
  ) {}

  private async decryptDateObject(date: any) {
    const coupleId = date?.coupleId?.toString?.() || date?.coupleId;
    if (!coupleId) return date;
    if (date.title) {
      date.title = await this.encryptionService.decryptForCouple(
        coupleId,
        date.title,
      );
    }
    if (date.description) {
      date.description = await this.encryptionService.decryptForCouple(
        coupleId,
        date.description,
      );
    }
    return date;
  }

  async findAllByCoupleId(coupleId: string) {
    const dates = await this.importantDateModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ date: 1 });

    return Promise.all(
      dates.map(async (date) =>
        this.decryptDateObject(await this.transformDate(date)),
      ),
    );
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

    const encryptedTitle = await this.encryptionService.encryptForCouple(
      coupleId,
      createDto.title,
    );
    const encryptedDescription =
      createDto.description !== undefined
        ? await this.encryptionService.encryptForCouple(
            coupleId,
            createDto.description,
          )
        : undefined;

    const newDate = new this.importantDateModel({
      ...createDto,
      title: encryptedTitle,
      description: encryptedDescription,
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
      description: `${user?.firstName || 'Biri'} yeni bir önemli tarih ekledi: "${createDto.title}"`,
      metadata: { title: createDto.title, date: populated.date },
    });

    // Send notification to partner
    this.notificationService.sendToPartner(
      userId,
      'Yeni Bir Tarih! 📅',
      `${user?.firstName} takvime yeni bir tarih ekledi: "${createDto.title}"`,
      { screen: 'important-dates' },
    );

    const transformed = await this.decryptDateObject(
      await this.transformDate(populated),
    );
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

    const { title, description, ...rest } = cleanUpdateDto;
    if (title !== undefined) {
      item.title = await this.encryptionService.encryptForCouple(
        item.coupleId.toString(),
        title,
      );
    }
    if (description !== undefined) {
      item.description = await this.encryptionService.encryptForCouple(
        item.coupleId.toString(),
        description,
      );
    }
    item.set(rest);
    const updated = await item.save();
    const populated = await updated.populate('authorId', 'firstName lastName avatar gender');

    const user = await this.coupleModel.db.model('User').findById(userId);
    const titleForLog =
      updateDto.title !== undefined
        ? updateDto.title
        : await this.encryptionService.decryptForCouple(
            updated.coupleId.toString(),
            updated.title,
          );
    await this.activityService.logActivity({
      userId,
      coupleId: populated.coupleId.toString(),
      module: 'important-dates',
      actionType: 'update',
      resourceId: id,
      description: `${user?.firstName || 'Biri'} "${titleForLog}" önemli tarihini güncelledi.`,
      metadata: { title: titleForLog },
    });

    const transformed = await this.decryptDateObject(
      await this.transformDate(populated),
    );
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

    const dateTitle = await this.encryptionService.decryptForCouple(
      item.coupleId.toString(),
      item.title,
    );
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
