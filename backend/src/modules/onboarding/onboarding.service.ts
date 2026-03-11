import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { User, UserDocument } from '../../schemas/user.schema';
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
import { Story, StoryDocument } from '../../schemas/story.schema';
import {
  QuizSession,
  QuizSessionDocument,
} from '../../schemas/quiz-session.schema';
import {
  QuizResult,
  QuizResultDocument,
} from '../../schemas/quiz-result.schema';
import { Feedback } from '../../schemas/feedback.schema';
import { Mood, MoodDocument } from '../../schemas/mood.schema';
import {
  CiftoConversation,
  CiftoConversationDocument,
} from '../../schemas/cifto-conversation.schema';
import { CreateCoupleDto } from './dto/onboarding.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';

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
    @InjectModel(Story.name) private storyModel: Model<StoryDocument>,
    @InjectModel(QuizSession.name)
    private quizSessionModel: Model<QuizSessionDocument>,
    @InjectModel(QuizResult.name)
    private quizResultModel: Model<QuizResultDocument>,
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    @InjectModel(Mood.name) private moodModel: Model<MoodDocument>,
    @InjectModel(CiftoConversation.name)
    private ciftoConversationModel: Model<CiftoConversationDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
  ) {}

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

    const pushKey = (key: string | undefined) => {
      if (key && !key.startsWith('http')) photoKeys.push(key);
    };

    // 1. Memories (foto + anıdan üretilen şarkı mp3)
    const memories = await this.memoryModel.find({ coupleId });
    memories.forEach((m) => {
      if (m.photos) {
        m.photos.forEach((p) => pushKey(p.url));
      }
      pushKey(m.generatedSongKey);
    });

    // 2. Gallery Photos
    const galleryPhotos = await this.galleryPhotoModel.find({ coupleId });
    galleryPhotos.forEach((gp) => pushKey(gp.photo?.url));

    // 3. Albums (Cover photos)
    const albums = await this.albumModel.find({ coupleId });
    albums.forEach((a) => pushKey(a.coverPhoto?.url));

    // 4. Time Capsules (foto + video; url veya key)
    const capsules = await this.timeCapsuleModel.find({ coupleId });
    capsules.forEach((c) => {
      if (c.photos) {
        c.photos.forEach((p) => {
          pushKey(p.key ?? p.url);
        });
      }
      if (c.video) {
        pushKey(c.video.key ?? c.video.url);
      }
    });

    // 5. Bucket List
    const bucketList = await this.bucketListModel.find({ coupleId });
    bucketList.forEach((bl) => {
      if (bl.photos) {
        bl.photos.forEach((p) => pushKey(p.url));
      }
    });

    // 6. User Avatars
    const partners = await this.userModel.find({ coupleId });
    partners.forEach((p) => pushKey(p.avatar?.url));

    // 7. Important Dates
    const importantDates = await this.importantDateModel.find({ coupleId });
    importantDates.forEach((id) => pushKey(id.photo?.url));

    // 8. Stories (TTS ses dosyaları)
    const stories = await this.storyModel.find({ coupleId });
    stories.forEach((s) => pushKey(s.audioKey));

    // 9. S3: tüm dosyaları sil (foto, video, mp3, ses)
    const uniqueKeys = [...new Set(photoKeys)];
    if (uniqueKeys.length > 0) {
      await Promise.all(
        uniqueKeys.map((key) => this.uploadService.deleteFile(key)),
      );
    }

    // 10. Tüm DB kayıtlarını sil
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
      this.storyModel.deleteMany({ coupleId }),
      this.quizResultModel.deleteMany({ coupleId }),
      this.quizSessionModel.deleteMany({ coupleId }),
      this.feedbackModel.deleteMany({ coupleId }),
      this.moodModel.deleteMany({ coupleId }),
      this.ciftoConversationModel.deleteMany({ coupleId }),
      this.userModel.deleteMany({ coupleId }),
      this.coupleModel.findByIdAndDelete(coupleId),
    ]);

    return { success: true };
  }
}
