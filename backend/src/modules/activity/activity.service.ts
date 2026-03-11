import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Activity, ActivityDocument } from '../../schemas/activity.schema';
import { CoupleDocument } from 'src/schemas/couple.schema';
import { UploadService } from '../upload/upload.service';
import { EncryptionService } from '../security/security.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private uploadService: UploadService,
    private encryptionService: EncryptionService,
  ) {}

  private isObjectId(value: any) {
    return (
      value instanceof Types.ObjectId ||
      value?._bsontype === 'ObjectId' ||
      typeof value?.toHexString === 'function'
    );
  }

  private async encryptValue(coupleId: string, value: any): Promise<any> {
    if (typeof value === 'string') {
      return this.encryptionService.encryptForCouple(coupleId, value);
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map((item) => this.encryptValue(coupleId, item)));
    }
    if (value instanceof Date || this.isObjectId(value)) {
      return value;
    }
    if (
      value &&
      typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Object]'
    ) {
      const entries = await Promise.all(
        Object.entries(value).map(async ([key, val]) => [
          key,
          await this.encryptValue(coupleId, val),
        ]),
      );
      return Object.fromEntries(entries);
    }
    return value;
  }

  private async decryptValue(coupleId: string, value: any): Promise<any> {
    if (typeof value === 'string') {
      return this.encryptionService.decryptForCouple(coupleId, value);
    }
    if (Array.isArray(value)) {
      return Promise.all(value.map((item) => this.decryptValue(coupleId, item)));
    }
    if (value instanceof Date || this.isObjectId(value)) {
      return value;
    }
    if (
      value &&
      typeof value === 'object' &&
      Object.prototype.toString.call(value) === '[object Object]'
    ) {
      const entries = await Promise.all(
        Object.entries(value).map(async ([key, val]) => [
          key,
          await this.decryptValue(coupleId, val),
        ]),
      );
      return Object.fromEntries(entries);
    }
    return value;
  }

  async logActivity(data: {
    userId: string;
    coupleId: string;
    module: string;
    actionType: 'create' | 'update' | 'delete' | 'answer' | 'favorite';
    resourceId?: string;
    description: string;
    metadata?: Record<string, any>;
  }) {
    const encryptedDescription = await this.encryptionService.encryptForCouple(
      data.coupleId,
      data.description,
    );
    const encryptedMetadata = data.metadata
      ? await this.encryptValue(data.coupleId, data.metadata)
      : undefined;
    const activity = new this.activityModel({
      userId: new Types.ObjectId(data.userId.toString()),
      coupleId: new Types.ObjectId(data.coupleId.toString()),
      module: data.module,
      actionType: data.actionType,
      resourceId: data.resourceId,
      description: encryptedDescription,
      metadata: encryptedMetadata,
    });
    return activity.save();
  }

  async findAllByCoupleId(
    coupleId: string,
    page: number = 1,
    limit: number = 10,
    module?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {
      coupleId: new Types.ObjectId(coupleId),
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

    const decryptedActivities = await Promise.all(
      activities.map(async (activity) => {
        const obj = activity.toObject ? activity.toObject() : activity;
        obj.description = await this.encryptionService.decryptForCouple(
          coupleId,
          obj.description,
        );
        if (obj.metadata) {
          obj.metadata = await this.decryptValue(coupleId, obj.metadata);
        }
        return obj;
      }),
    );

    return {
      activities: decryptedActivities,
      total,
      hasMore: total > skip + activities.length,
    };
  }
}
