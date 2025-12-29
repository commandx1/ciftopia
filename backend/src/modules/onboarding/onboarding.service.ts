import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateCoupleDto } from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
  ) {}

  async checkSubdomain(subdomain: string) {
    const existingCouple = await this.coupleModel.findOne({
      subdomain: subdomain.toLowerCase(),
    });
    return { available: !existingCouple };
  }

  async createCouple(userId: string, createCoupleDto: CreateCoupleDto) {
    const {
      subdomain,
      partnerFirstName,
      partnerLastName,
      partnerEmail,
      partnerPassword,
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

    const couple = new this.coupleModel({
      subdomain: lowerSubdomain,
      partner1: new Types.ObjectId(userId),
      coupleName: `${user.firstName} & ${partnerFirstName}`,
      relationshipStartDate: relationshipStartDate
        ? new Date(relationshipStartDate)
        : undefined,
      relationshipStatus,
      status: paymentTransactionId ? 'active' : 'pending_payment',
    });

    await couple.save();

    // Create and link partner2
    const partner2 = new this.userModel({
      email: partnerEmail,
      password: hashedPassword,
      firstName: partnerFirstName,
      lastName: partnerLastName,
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

    return couple;
  }
}
