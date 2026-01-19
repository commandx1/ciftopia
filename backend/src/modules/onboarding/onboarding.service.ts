import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Memory, MemoryDocument } from '../../schemas/memory.schema';
import { Album, AlbumDocument } from '../../schemas/album.schema';
import {
  GalleryPhoto,
  GalleryPhotoDocument,
} from '../../schemas/gallery-photo.schema';
import {
  BucketListItem,
  BucketListItemDocument,
} from '../../schemas/bucket-list.schema';
import {
  ImportantDate,
  ImportantDateDocument,
} from '../../schemas/important-date.schema';
import {
  TimeCapsule,
  TimeCapsuleDocument,
} from '../../schemas/time-capsule.schema';
import { Poem, PoemDocument } from '../../schemas/poem.schema';
import { Note, NoteDocument } from '../../schemas/note.schema';
import { Activity, ActivityDocument } from '../../schemas/activity.schema';
import {
  QuestionAnswer,
  QuestionAnswerDocument,
} from '../../schemas/question-answer.schema';
import {
  CoupleQuestionStats,
  CoupleQuestionStatsDocument,
} from '../../schemas/couple-question-stats.schema';
import {
  DailyQuestion,
  DailyQuestionDocument,
} from '../../schemas/daily-question.schema';
import { CreateCoupleDto } from './dto/onboarding.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(GalleryPhoto.name)
    private galleryPhotoModel: Model<GalleryPhotoDocument>,
    @InjectModel(BucketListItem.name)
    private bucketListModel: Model<BucketListItemDocument>,
    @InjectModel(ImportantDate.name)
    private importantDateModel: Model<ImportantDateDocument>,
    @InjectModel(TimeCapsule.name)
    private timeCapsuleModel: Model<TimeCapsuleDocument>,
    @InjectModel(Poem.name) private poemModel: Model<PoemDocument>,
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(QuestionAnswer.name)
    private questionAnswerModel: Model<QuestionAnswerDocument>,
    @InjectModel(CoupleQuestionStats.name)
    private coupleQuestionStatsModel: Model<CoupleQuestionStatsDocument>,
    @InjectModel(DailyQuestion.name)
    private dailyQuestionModel: Model<DailyQuestionDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
  ) {}

  async checkSubdomain(subdomain: string) {
    // add user names via partner1 and partner2 from couple collection
    const existingCouple = await this.coupleModel
      .findOne({
        subdomain: subdomain.toLowerCase(),
      })
      .populate('partner1')
      .populate('partner2')
      .lean();
    // available: true -> Bu subdomain boş, kullanılabilir.
    // available: false -> Bu subdomain dolu, zaten alınmış.
    return {
      available: !existingCouple,
      couple: existingCouple
        ? `${capitalizeFirstLetter((existingCouple.partner1 as unknown as User).firstName)} & ${capitalizeFirstLetter((existingCouple.partner2 as unknown as User).firstName)}`
        : null,
    };
  }

  async getEarlyBirdStatus() {
    const count = await this.coupleModel.countDocuments({ isEarlyBird: true });
    const limit = 50;
    return {
      count,
      limit,
      available: count < limit,
    };
  }

  async createCouple(userId: string, createCoupleDto: CreateCoupleDto) {
    const {
      subdomain,
      partnerFirstName,
      partnerLastName,
      partnerEmail,
      partnerPassword,
      partnerGender,
      partnerAvatar,
      relationshipStartDate,
      relationshipStatus,
      paymentTransactionId,
    } = createCoupleDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (user.coupleId) {
      throw new ConflictException('Kullanıcının zaten bir çift hesabı var.');
    }

    const lowerSubdomain = subdomain.toLowerCase();
    const existingCouple = await this.coupleModel.findOne({
      subdomain: lowerSubdomain,
    });
    if (existingCouple) {
      throw new ConflictException('Bu subdomain zaten alınmış.');
    }

    // Check if partner email is already in use
    const existingPartnerUser = await this.userModel.findOne({
      email: partnerEmail,
    });
    if (existingPartnerUser) {
      throw new ConflictException('Partner e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(partnerPassword, 10);

    // Calculate initial storage used from avatars
    let initialStorageUsed = 0;
    if (user.avatar && typeof user.avatar !== 'string' && user.avatar.size) {
      initialStorageUsed += user.avatar.size;
    }
    if (
      partnerAvatar &&
      typeof partnerAvatar !== 'string' &&
      partnerAvatar.size
    ) {
      initialStorageUsed += partnerAvatar.size;
    }

    // Early Bird Check
    const earlyBirdStatus = await this.getEarlyBirdStatus();
    const isEarlyBird = earlyBirdStatus.available && !paymentTransactionId;

    const couple = new this.coupleModel({
      subdomain: lowerSubdomain,
      partner1: new Types.ObjectId(userId),
      coupleName: `${user.firstName} & ${partnerFirstName}`,
      relationshipStartDate: relationshipStartDate
        ? new Date(relationshipStartDate)
        : undefined,
      relationshipStatus,
      status:
        paymentTransactionId || isEarlyBird ? 'active' : 'pending_payment',
      storageUsed: initialStorageUsed,
      isEarlyBird: isEarlyBird,
      storageLimit: isEarlyBird ? 1073741824 : 52428800, // 1GB for early bird, 50MB default
    });

    await couple.save();

    // Create and link partner2
    const partner2 = new this.userModel({
      email: partnerEmail,
      password: hashedPassword,
      firstName: partnerFirstName,
      lastName: partnerLastName,
      gender: partnerGender as string,
      avatar: partnerAvatar,
      role: 'partner2',
      coupleId: couple._id,
    });

    await partner2.save();

    // Update couple with partner2 ID
    couple.partner2 = partner2._id;
    await couple.save();

    // Update partner1 (current user)
    user.coupleId = couple._id;
    await user.save();

    await this.activityService.logActivity({
      userId,
      coupleId: couple._id.toString(),
      module: 'onboarding',
      actionType: 'create',
      resourceId: couple._id.toString(),
      description: `${user.firstName} ve ${partnerFirstName} için yeni bir dünya oluşturuldu! ❤️`,
      metadata: { subdomain: lowerSubdomain },
    });

    return couple;
  }

  async deleteSite(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new NotFoundException('Silinecek site bulunamadı.');
    }

    const coupleId = user.coupleId;
    const couple = await this.coupleModel.findById(coupleId);
    if (!couple) {
      throw new NotFoundException('Çift hesabı bulunamadı.');
    }

    const photoKeys: string[] = [];

    // 1. Memories
    const memories = await this.memoryModel.find({ coupleId });
    memories.forEach((m) => {
      if (m.photos) {
        m.photos.forEach((p) => {
          if (p.url && !p.url.startsWith('http')) photoKeys.push(p.url);
        });
      }
    });

    // 2. Gallery Photos
    const galleryPhotos = await this.galleryPhotoModel.find({ coupleId });
    galleryPhotos.forEach((gp) => {
      if (gp.photo?.url && !gp.photo.url.startsWith('http'))
        photoKeys.push(gp.photo.url);
    });

    // 3. Albums (Cover photos)
    const albums = await this.albumModel.find({ coupleId });
    albums.forEach((a) => {
      if (a.coverPhoto?.url && !a.coverPhoto.url.startsWith('http'))
        photoKeys.push(a.coverPhoto.url);
    });

    // 4. Time Capsules
    const capsules = await this.timeCapsuleModel.find({ coupleId });
    capsules.forEach((c) => {
      if (c.photos) {
        c.photos.forEach((p) => {
          if (p.url && !p.url.startsWith('http')) photoKeys.push(p.url);
        });
      }
      if (c.video?.url && !c.video.url.startsWith('http'))
        photoKeys.push(c.video.url);
    });

    // 5. Bucket List
    const bucketList = await this.bucketListModel.find({ coupleId });
    bucketList.forEach((bl) => {
      if (bl.photos) {
        bl.photos.forEach((p) => {
          if (p.url && !p.url.startsWith('http')) photoKeys.push(p.url);
        });
      }
    });

    // 6. User Avatars
    const partners = await this.userModel.find({ coupleId });
    partners.forEach((p) => {
      if (p.avatar?.url && !p.avatar.url.startsWith('http'))
        photoKeys.push(p.avatar.url);
    });

    // 7. Important Dates
    const importantDates = await this.importantDateModel.find({ coupleId });
    importantDates.forEach((id) => {
      if (id.photo?.url && !id.photo.url.startsWith('http'))
        photoKeys.push(id.photo.url);
    });

    // 8. Delete all files from S3
    const uniqueKeys = [...new Set(photoKeys)];
    if (uniqueKeys.length > 0) {
      await Promise.all(
        uniqueKeys.map((key) => this.uploadService.deleteFile(key)),
      );
    }

    // 9. Delete all records from all collections
    await Promise.all([
      this.memoryModel.deleteMany({ coupleId }),
      this.galleryPhotoModel.deleteMany({ coupleId }),
      this.albumModel.deleteMany({ coupleId }),
      this.timeCapsuleModel.deleteMany({ coupleId }),
      this.bucketListModel.deleteMany({ coupleId }),
      this.importantDateModel.deleteMany({ coupleId }),
      this.poemModel.deleteMany({ coupleId }),
      this.noteModel.deleteMany({ coupleId }),
      this.activityModel.deleteMany({ coupleId }),
      this.questionAnswerModel.deleteMany({ coupleId }),
      this.coupleQuestionStatsModel.deleteMany({ coupleId }),
      this.dailyQuestionModel.deleteMany({ coupleId }),
      this.userModel.deleteMany({ coupleId }),
      this.coupleModel.findByIdAndDelete(coupleId),
    ]);

    return { success: true };
  }
}
