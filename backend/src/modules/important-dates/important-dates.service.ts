import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImportantDate, ImportantDateDocument } from '../../schemas/important-date.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateImportantDateDto, UpdateImportantDateDto } from './dto/important-date.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ImportantDatesService {
  constructor(
    @InjectModel(ImportantDate.name) private importantDateModel: Model<ImportantDateDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
  ) {}

  async findAllBySubdomain(subdomain: string) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    const dates = await this.importantDateModel
      .find({ coupleId: couple._id as any })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ date: 1 });

    return Promise.all(dates.map(date => this.transformDate(date)));
  }

  async create(subdomain: string, userId: string, createDto: CreateImportantDateDto) {
    if (!userId) throw new BadRequestException('Kullanıcı bilgisi eksik');
    const couple = await this.coupleModel.findOne({ subdomain });
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
      coupleId: couple._id,
      authorId: userId,
    });

    const saved = await newDate.save();
    const transformed = await this.transformDate(saved);
    return {
      date: transformed,
      storageUsed: couple.storageUsed,
      storageLimit: couple.storageLimit,
    };
  }

  async update(id: string, userId: string, updateDto: UpdateImportantDateDto) {
    const item = await this.importantDateModel.findById(id);
    if (!item) throw new NotFoundException('Tarih bulunamadı');

    if (item.authorId.toString() !== userId) {
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
    const transformed = await this.transformDate(updated);
    return {
      date: transformed,
      storageUsed: couple.storageUsed,
      storageLimit: couple.storageLimit,
    };
  }

  async delete(id: string, userId: string) {
    const item = await this.importantDateModel.findById(id);
    if (!item) throw new NotFoundException('Tarih bulunamadı');

    if (item.authorId.toString() !== userId) {
      throw new ForbiddenException('Bu tarihi silme yetkiniz yok');
    }

    const couple = await this.coupleModel.findById(item.coupleId);

    // Update storage
    if (item.photo?.size && couple) {
      couple.storageUsed = Math.max(0, couple.storageUsed - item.photo.size);
      await couple.save();
    }

    await item.deleteOne();
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
