import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Mood, MoodDocument } from '../../schemas/mood.schema';
import { CreateMoodDto } from './dto/mood.dto';

@Injectable()
export class MoodService {
  constructor(
    @InjectModel(Mood.name) private moodModel: Model<MoodDocument>,
  ) {}

  async createOrUpdateMood(userId: string, coupleId: string, createMoodDto: CreateMoodDto): Promise<Mood> {
    const { emoji, note, date } = createMoodDto;
    const moodDate = new Date(date);
    moodDate.setUTCHours(0, 0, 0, 0);

    return this.moodModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        coupleId: new Types.ObjectId(coupleId),
        date: moodDate,
      },
      {
        emoji,
        note,
      },
      { upsert: true, new: true },
    ).exec();
  }

  async getMoodsByDateRange(coupleId: string, startDate: Date, endDate: Date): Promise<Mood[]> {
    return this.moodModel
      .find({
        coupleId: new Types.ObjectId(coupleId),
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .exec();
  }

  async getMonthlyStats(coupleId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const moods = await this.getMoodsByDateRange(coupleId, startDate, endDate);

    const stats = moods.reduce((acc, mood) => {
      acc[mood.emoji] = (acc[mood.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMoods: moods.length,
      emojiCounts: stats,
      moods,
    };
  }

  async getPagedNotes(coupleId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const notes = await this.moodModel
      .find({
        coupleId: new Types.ObjectId(coupleId),
        note: { $exists: true, $ne: '' },
      })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.moodModel.countDocuments({
      coupleId: new Types.ObjectId(coupleId),
      note: { $exists: true, $ne: '' },
    });

    return {
      notes,
      total,
      hasMore: total > skip + notes.length,
    };
  }
}
