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

@Injectable()
export class BucketListService {
  constructor(
    @InjectModel(BucketListItem.name)
    private bucketListItemModel: Model<BucketListItemDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
  ) {}

  async findAllBySubdomain(subdomain: string) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) throw new NotFoundException('Site bulunamadı');

    return this.bucketListItemModel
      .find({ coupleId: couple._id })
      .populate('authorId', 'firstName lastName avatar gender')
      .populate('completedBy', 'firstName lastName avatar gender')
      .sort({ isCompleted: 1, createdAt: -1 });
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
    return savedItem.populate('authorId', 'firstName lastName avatar gender');
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
    return updatedItem.populate([
      { path: 'authorId', select: 'firstName lastName avatar gender' },
      { path: 'completedBy', select: 'firstName lastName avatar gender' },
    ]);
  }

  async delete(userId: string, itemId: string) {
    const item = await this.bucketListItemModel.findById(itemId);
    if (!item) throw new NotFoundException('Hayal bulunamadı');

    // Sadece yazan kişi silebilir kuralı eklenebilir veya partnerlerden herhangi biri
    // Biz şimdilik partnerlerden herhangi birine izin veriyoruz (CoupleOwnerGuard kontrolünde)

    await this.bucketListItemModel.findByIdAndDelete(itemId);
    return { success: true };
  }
}
