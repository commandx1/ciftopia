import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from '../../schemas/activity.schema';
import { CoupleDocument } from 'src/schemas/couple.schema';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private uploadService: UploadService,
  ) {}

  async logActivity(data: {
    userId: string;
    coupleId: string;
    module: string;
    actionType: 'create' | 'update' | 'delete' | 'answer' | 'favorite';
    resourceId?: string;
    description: string;
    metadata?: Record<string, any>;
  }) {
    const activity = new this.activityModel({
      userId: new Types.ObjectId(data.userId.toString()),
      coupleId: new Types.ObjectId(data.coupleId.toString()),
      module: data.module,
      actionType: data.actionType,
      resourceId: data.resourceId,
      description: data.description,
      metadata: data.metadata,
    });
    return activity.save();
  }

  async findAllBySubdomain(
    coupleId: CoupleDocument,
    page: number = 1,
    limit: number = 10,
    module?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {
      coupleId: new Types.ObjectId(coupleId._id.toString()),
    };

    if (module && module !== 'all') {
      filter.module = module;
    }

    const [activities, total] = await Promise.all([
      this.activityModel
        .find(filter)
        .populate('userId', 'firstName lastName avatar gender')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.activityModel.countDocuments(filter),
    ]);

    // Transform avatar URLs
    await this.uploadService.transformAvatars(activities, 'userId');

    return {
      activities,
      total,
      hasMore: total > skip + activities.length,
    };
  }
}
