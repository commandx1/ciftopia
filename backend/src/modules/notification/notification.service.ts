import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class NotificationService {
  private expo = new Expo();
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /** Çiftteki her iki partnere push bildirimi gönderir (expoPushToken'ı olanlar). */
  async sendToCouple(
    coupleId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const users = await this.userModel
        .find({
          coupleId: new Types.ObjectId(coupleId),
          expoPushToken: { $exists: true, $ne: '' },
        })
        .select('expoPushToken')
        .lean()
        .exec();

      const messages: ExpoPushMessage[] = users
        .filter((u) => u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken))
        .map((u) => ({
          to: u.expoPushToken!,
          sound: 'default' as const,
          title,
          body,
          data,
        }));

      if (messages.length === 0) return;

      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          await this.expo.sendPushNotificationsAsync(chunk);
          this.logger.log('Push notification sent to couple');
        } catch (error) {
          this.logger.error('Error sending push notification chunk', error);
        }
      }
    } catch (error) {
      this.logger.error('Error in sendToCouple', error);
    }
  }

  async sendToPartner(userId: string, title: string, body: string, data?: any) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user || !user.coupleId) return;

      const partner = await this.userModel.findOne({
        coupleId: user.coupleId,
        _id: { $ne: user._id },
      });

      if (!partner || !partner.expoPushToken) {
        this.logger.log(`Partner has no push token for user ${userId}`);
        return;
      }

      if (!Expo.isExpoPushToken(partner.expoPushToken)) {
        this.logger.error(`Push token ${partner.expoPushToken} is not a valid Expo push token`);
        return;
      }

      const messages: ExpoPushMessage[] = [
        {
          to: partner.expoPushToken,
          sound: 'default',
          title,
          body,
          data,
        },
      ];

      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          this.logger.log('Push notification sent successfully');
        } catch (error) {
          this.logger.error('Error sending push notification chunk', error);
        }
      }
    } catch (error) {
      this.logger.error('Error in sendToPartner', error);
    }
  }
}
