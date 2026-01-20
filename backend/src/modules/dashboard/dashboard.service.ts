import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Memory, MemoryDocument } from '../../schemas/memory.schema';
import {
  GalleryPhoto,
  GalleryPhotoDocument,
} from '../../schemas/gallery-photo.schema';
import { Poem, PoemDocument } from '../../schemas/poem.schema';
import { Note, NoteDocument } from '../../schemas/note.schema';
import { Activity, ActivityDocument } from '../../schemas/activity.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { Album, AlbumDocument } from '../../schemas/album.schema';
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
import {
  QuestionAnswer,
  QuestionAnswerDocument,
} from '../../schemas/question-answer.schema';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    @InjectModel(GalleryPhoto.name)
    private galleryPhotoModel: Model<GalleryPhotoDocument>,
    @InjectModel(Poem.name) private poemModel: Model<PoemDocument>,
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(BucketListItem.name)
    private bucketListModel: Model<BucketListItemDocument>,
    @InjectModel(ImportantDate.name)
    private importantDateModel: Model<ImportantDateDocument>,
    @InjectModel(TimeCapsule.name)
    private timeCapsuleModel: Model<TimeCapsuleDocument>,
    @InjectModel(QuestionAnswer.name)
    private questionAnswerModel: Model<QuestionAnswerDocument>,
    private uploadService: UploadService,
  ) {}

  async getStats(coupleId: string) {
    try {
      const cid = new Types.ObjectId(coupleId);

      // 1. All Counts for Distribution
      const [
        memoryCount,
        photoCount,
        poemCount,
        noteCount,
        bucketCount,
        dateCount,
        capsuleCount,
        answerCount,
      ] = await Promise.all([
        this.memoryModel.countDocuments({ coupleId: cid }),
        this.galleryPhotoModel.countDocuments({ coupleId: cid }),
        this.poemModel.countDocuments({ coupleId: cid }),
        this.noteModel.countDocuments({ coupleId: cid }),
        this.bucketListModel.countDocuments({ coupleId: cid }),
        this.importantDateModel.countDocuments({ coupleId: cid }),
        this.timeCapsuleModel.countDocuments({ coupleId: cid }),
        this.questionAnswerModel.countDocuments({ coupleId: cid }),
      ]);

      // 2. Couple Info
      const couple = await this.coupleModel
        .findById(cid)
        .populate('partner1', 'firstName lastName avatar gender')
        .populate('partner2', 'firstName lastName avatar gender')
        .lean()
        .exec();

      const coupleObj = couple as any;
      const createdAt = coupleObj?.createdAt || new Date();
      const createdAtTime = new Date(createdAt as string).getTime();
      const daysActive = Math.max(
        1,
        Math.floor((Date.now() - createdAtTime) / (1000 * 60 * 60 * 24)),
      );

      // 3. Weekly Activity - Aggregating from all collections
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const modelsToTrack = [
        this.memoryModel,
        this.galleryPhotoModel,
        this.poemModel,
        this.noteModel,
        this.bucketListModel,
        this.importantDateModel,
        this.timeCapsuleModel,
        this.questionAnswerModel,
      ];

      const weeklyResults = await Promise.all(
        modelsToTrack.map((model) =>
          model.aggregate([
            {
              $match: {
                coupleId: cid,
                createdAt: { $gte: sevenDaysAgo },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                count: { $sum: 1 },
              },
            },
          ]),
        ),
      );

      // Merge results from all models into a single map by date
      const activityMap = new Map<string, number>();
      weeklyResults.forEach((results: any[]) => {
        results.forEach((res) => {
          const dateKey = String(res._id);
          const current = activityMap.get(dateKey) || 0;
          activityMap.set(dateKey, current + (res.count as number));
        });
      });

      // Format last 7 days
      const weeklyActivity = [];
      const dayNames = [
        'Pazar',
        'Pazartesi',
        'Salı',
        'Çarşamba',
        'Perşembe',
        'Cuma',
        'Cumartesi',
      ];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        weeklyActivity.push({
          day: dayNames[d.getDay()],
          count: activityMap.get(dateStr) || 0,
          date: dateStr,
        });
      }

      // 4. Detailed Distribution
      const totalContent =
        memoryCount +
        photoCount +
        poemCount +
        noteCount +
        bucketCount +
        dateCount +
        capsuleCount +
        answerCount;

      const distribution = [
        {
          label: 'Anılar',
          count: memoryCount,
          color: 'rose',
        },
        {
          label: 'Fotoğraflar',
          count: photoCount,
          color: 'purple',
        },
        {
          label: 'Şiirler',
          count: poemCount,
          color: 'amber',
        },
        {
          label: 'Notlar',
          count: noteCount,
          color: 'green',
        },
        {
          label: 'Sorular',
          count: answerCount,
          color: 'indigo',
        },
        {
          label: 'Diğer',
          count: bucketCount + dateCount + capsuleCount,
          color: 'blue',
        },
      ].map((item) => ({
        ...item,
        percentage:
          totalContent > 0 ? Math.round((item.count / totalContent) * 100) : 0,
      }));

      // 5. Recent Activities
      const recentActivities = await this.activityModel
        .find({ coupleId: cid })
        .populate('userId', 'firstName lastName avatar gender')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec();

      // Transform avatar URLs for partners and activity users
      if (coupleObj?.partner1) await this.uploadService.transformAvatar(coupleObj.partner1);
      if (coupleObj?.partner2) await this.uploadService.transformAvatar(coupleObj.partner2);

      await this.uploadService.transformAvatars(recentActivities, 'userId');

      return {
        stats: {
          memoryCount,
          photoCount,
          poemCount,
          noteCount,
          totalContent,
        },
        coupleInfo: {
          daysActive,
          storageUsed: (coupleObj?.storageUsed as number) || 0,
          storageLimit: (coupleObj?.storageLimit as number) || 1073741824,
          relationshipStartDate: coupleObj?.relationshipStartDate as string,
          coupleName: coupleObj?.coupleName as string,
          partner1: coupleObj?.partner1,
          partner2: coupleObj?.partner2,
        },
        recentActivities,
        weeklyActivity,
        distribution,
      };
    } catch (error) {
      console.error('Dashboard stats calculation error:', error);
      throw error;
    }
  }
}
