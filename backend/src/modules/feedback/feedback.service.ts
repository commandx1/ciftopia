import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback } from '../../schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
  ) {}

  async create(userId: string, coupleId: string, createFeedbackDto: CreateFeedbackDto) {
    const feedback = new this.feedbackModel({
      userId: new Types.ObjectId(userId),
      coupleId: new Types.ObjectId(coupleId),
      subdomain: createFeedbackDto.subdomain,
      email: createFeedbackDto.email,
      partner1: createFeedbackDto.partner1,
      partner2: createFeedbackDto.partner2,
      rating: createFeedbackDto.rating,
      features: createFeedbackDto.features,
      likedFeatures: createFeedbackDto.liked_features,
      improvements: createFeedbackDto.improvements,
      bugs: createFeedbackDto.bugs,
      featureRequests: createFeedbackDto.feature_requests,
      device: createFeedbackDto.device,
      frequency: createFeedbackDto.frequency,
      easeOfUse: createFeedbackDto.ease_of_use,
      design: createFeedbackDto.design,
      performance: createFeedbackDto.performance,
      recommend: createFeedbackDto.recommend,
      wouldPay: createFeedbackDto.would_pay,
      priceRange: createFeedbackDto.price_range,
      additionalComments: createFeedbackDto.additional_comments,
      consent: createFeedbackDto.consent,
    });
    return feedback.save();
  }

  async getStats() {
    const totalFeedback = await this.feedbackModel.countDocuments();
    // In a real scenario, we could calculate other stats here
    return {
      totalFeedback,
      limit: 50, // Founding couples limit
    };
  }
}
