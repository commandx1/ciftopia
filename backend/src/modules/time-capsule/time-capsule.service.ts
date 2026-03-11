import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TimeCapsule,
  TimeCapsuleDocument,
} from '../../schemas/time-capsule.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import {
  CreateTimeCapsuleDto,
  UpdateTimeCapsuleDto,
} from './dto/time-capsule.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
import { EncryptionService } from '../security/security.service';

@Injectable()
export class TimeCapsuleService {
  constructor(
    @InjectModel(TimeCapsule.name)
    private timeCapsuleModel: Model<TimeCapsuleDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
    private encryptionService: EncryptionService,
  ) {}

  private async decryptCapsuleObject(capsule: any) {
    const coupleId = capsule?.coupleId?.toString?.() || capsule?.coupleId;
    if (!coupleId) return capsule;
    if (capsule.title) {
      capsule.title = await this.encryptionService.decryptForCouple(
        coupleId,
        capsule.title,
      );
    }
    if (capsule.content) {
      capsule.content = await this.encryptionService.decryptForCouple(
        coupleId,
        capsule.content,
      );
    }
    if (capsule.reflections && capsule.reflections.length > 0) {
      capsule.reflections = await Promise.all(
        capsule.reflections.map(async (refl: any) => ({
          ...refl,
          content: await this.encryptionService.decryptForCouple(
            coupleId,
            refl.content,
          ),
        })),
      );
    }
    return capsule;
  }

  private async transformCapsule(capsule: TimeCapsuleDocument) {
    const obj: any = capsule.toObject();
    const now = new Date();
    const isLocked = new Date(obj.unlockDate) > now;

    // If locked, hide content and photos
    if (isLocked && !obj.isOpened) {
      obj.content = '🔒 Bu mektup henüz kilitli.';
      obj.photos = [];
      obj.video = null;
    } else {
      // Transform photos to presigned URLs
      if (obj.photos && obj.photos.length > 0) {
        obj.photos = await Promise.all(
          obj.photos.map(async (photo: any) => {
            const presignedUrl = await this.uploadService.getPresignedUrl(
              photo.key || photo.url,
            );
            return { ...photo, url: presignedUrl };
          }),
        );
      }

      // Transform video to presigned URL
      if (obj.video) {
        const presignedUrl = await this.uploadService.getPresignedUrl(
          obj.video.key || obj.video.url,
        );
        obj.video.url = presignedUrl;
      }
    }

    await this.decryptCapsuleObject(obj);

    // Transform author avatar if populated
    if (obj.authorId) {
      await this.uploadService.transformAvatar(obj.authorId);
    }

    // Transform reflection author avatars
    if (obj.reflections && obj.reflections.length > 0) {
      await Promise.all(
        obj.reflections.map(async (refl: any) => {
          if (refl.authorId) {
            await this.uploadService.transformAvatar(refl.authorId);
          }
        }),
      );
    }

    return obj;
  }

  async findAllByCoupleId(coupleId: CoupleDocument) {
    const capsules = await this.timeCapsuleModel
      .find({ coupleId: coupleId._id })
      .populate('authorId', 'firstName lastName avatar gender')
      .populate('reflections.authorId', 'firstName lastName avatar gender')
      .sort({ unlockDate: 1 })
      .exec();

    return Promise.all(capsules.map((c) => this.transformCapsule(c)));
  }

  async findOne(id: string, userId: string) {
    const capsule = await this.timeCapsuleModel
      .findById(id)
      .populate('authorId', 'firstName lastName avatar gender')
      .populate('reflections.authorId', 'firstName lastName avatar gender')
      .exec();
    if (!capsule) throw new NotFoundException('Zaman kapsülü bulunamadı.');

    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });

    if (!couple || capsule.coupleId.toString() !== couple._id.toString()) {
      throw new ForbiddenException('Bu kapsüle erişim yetkiniz yok.');
    }

    const now = new Date();
    const isLocked = new Date(capsule.unlockDate) > now;

    if (isLocked) {
      throw new ForbiddenException('Bu kapsül henüz açılmadı.');
    }

    // Mark as opened if first time
    if (!capsule.isOpened) {
      capsule.isOpened = true;
      await capsule.save();
    }

    return this.transformCapsule(capsule);
  }

  async create(userId: string, dto: CreateTimeCapsuleDto) {
    const couple = await this.coupleModel.findOne({
      $or: [
        { partner1: new Types.ObjectId(userId) },
        { partner2: new Types.ObjectId(userId) },
      ],
    });
    if (!couple) throw new NotFoundException('Çift hesabı bulunamadı.');

    const encryptedTitle = await this.encryptionService.encryptForCouple(
      couple._id.toString(),
      dto.title,
    );
    const encryptedContent = await this.encryptionService.encryptForCouple(
      couple._id.toString(),
      dto.content,
    );

    const capsule = new this.timeCapsuleModel({
      ...dto,
      title: encryptedTitle,
      content: encryptedContent,
      coupleId: couple._id,
      authorId: new Types.ObjectId(userId),
      unlockDate: new Date(dto.unlockDate),
      isOpened: false,
    });

    const saved = await capsule.save();

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: couple._id.toString(),
      module: 'time-capsule',
      actionType: 'create',
      resourceId: saved._id.toString(),
      description: `${user?.firstName || 'Biri'} yeni bir zaman kapsülü oluşturdu: "${dto.title}"`,
      metadata: { title: dto.title, unlockDate: saved.unlockDate },
    });
    
    // Populate author info before returning
    const populated = await this.timeCapsuleModel
      .findById(saved._id)
      .populate('authorId', 'firstName lastName avatar gender')
      .exec();

    // Video kotası presigned-video isteğinde rezerve edildi; burada sadece foto boyutları eklenir.
    let totalSize = 0;
    if (dto.photos && dto.photos.length > 0) {
      totalSize += dto.photos.reduce((acc, p) => acc + (p.size || 0), 0);
    }

    if (totalSize > 0) {
      await this.coupleModel.findByIdAndUpdate(couple._id, {
        $inc: { storageUsed: totalSize },
      });
    }

    return this.transformCapsule(populated as TimeCapsuleDocument);
  }

  async update(id: string, userId: string, dto: UpdateTimeCapsuleDto) {
    const capsule = await this.timeCapsuleModel.findById(id);
    if (!capsule) throw new NotFoundException('Zaman kapsülü bulunamadı.');

    if (capsule.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'Sadece kendi oluşturduğunuz kapsülleri güncelleyebilirsiniz.',
      );
    }

    if (capsule.isOpened || new Date(capsule.unlockDate) <= new Date()) {
      throw new ForbiddenException(
        'Açılmış veya açılma tarihi gelmiş kapsüller güncellenemez.',
      );
    }

    const { title, content, ...rest } = dto;
    if (title !== undefined) {
      capsule.title = await this.encryptionService.encryptForCouple(
        capsule.coupleId.toString(),
        title,
      );
    }
    if (content !== undefined) {
      capsule.content = await this.encryptionService.encryptForCouple(
        capsule.coupleId.toString(),
        content,
      );
    }
    Object.assign(capsule, rest);
    if (dto.unlockDate) capsule.unlockDate = new Date(dto.unlockDate);

    const saved = await capsule.save();

    const user = await this.coupleModel.db.model('User').findById(userId);
    const titleForLog =
      title ??
      (await this.encryptionService.decryptForCouple(
        capsule.coupleId.toString(),
        saved.title,
      ));
    await this.activityService.logActivity({
      userId,
      coupleId: capsule.coupleId.toString(),
      module: 'time-capsule',
      actionType: 'update',
      resourceId: id,
      description: `${user?.firstName || 'Biri'} "${titleForLog}" zaman kapsülünü güncelledi.`,
      metadata: { title: titleForLog },
    });

    return this.transformCapsule(saved);
  }

  async remove(id: string, userId: string) {
    const capsule = await this.timeCapsuleModel.findById(id);
    if (!capsule) throw new NotFoundException('Zaman kapsülü bulunamadı.');

    if (capsule.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'Sadece kendi oluşturduğunuz kapsülleri silebilirsiniz.',
      );
    }

    // Cleanup photos, video and storage
    let totalSize = 0;
    if (capsule.photos && capsule.photos.length > 0) {
      totalSize += capsule.photos.reduce(
        (acc, p) => acc + (p.size || 0),
        0,
      );
      await Promise.all(
        capsule.photos.map((p) =>
          this.uploadService.deleteFile(p.key || p.url),
        ),
      );
    }

    if (capsule.video) {
      totalSize += capsule.video.size || 0;
      await this.uploadService.deleteFile(capsule.video.key || capsule.video.url);
    }

    if (totalSize > 0) {
      await this.coupleModel.findByIdAndUpdate(capsule.coupleId, {
        $inc: { storageUsed: -totalSize },
      });
    }

    const capsuleTitle = await this.encryptionService.decryptForCouple(
      capsule.coupleId.toString(),
      capsule.title,
    );
    await this.timeCapsuleModel.findByIdAndDelete(id);

    const user = await this.coupleModel.db.model('User').findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: capsule.coupleId.toString(),
      module: 'time-capsule',
      actionType: 'delete',
      description: `${user?.firstName || 'Biri'} "${capsuleTitle}" zaman kapsülünü sildi.`,
      metadata: { title: capsuleTitle },
    });

    return { success: true };
  }

  async addReflection(id: string, userId: string, dto: { content: string }) {
    const capsule = await this.timeCapsuleModel.findById(id);
    if (!capsule) throw new NotFoundException('Zaman kapsülü bulunamadı.');

    const now = new Date();
    const isLocked = new Date(capsule.unlockDate) > now;

    if (isLocked) {
      throw new ForbiddenException(
        'Bu kapsül henüz açılmadı, yorum yapılamaz.',
      );
    }

    const encryptedContent = await this.encryptionService.encryptForCouple(
      capsule.coupleId.toString(),
      dto.content,
    );
    capsule.reflections.push({
      authorId: new Types.ObjectId(userId),
      content: encryptedContent,
      createdAt: new Date(),
    });

    await capsule.save();

    const user = await this.coupleModel.db.model('User').findById(userId);
    const titleForLog = await this.encryptionService.decryptForCouple(
      capsule.coupleId.toString(),
      capsule.title,
    );
    await this.activityService.logActivity({
      userId,
      coupleId: capsule.coupleId.toString(),
      module: 'time-capsule',
      actionType: 'answer',
      resourceId: id,
      description: `${user?.firstName || 'Biri'} "${titleForLog}" zaman kapsülüne bir düşünce ekledi.`,
      metadata: { title: titleForLog },
    });

    // Return the updated capsule with populated authors
    return this.findOne(id, userId);
  }
}
