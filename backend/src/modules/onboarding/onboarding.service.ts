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
import { CreateCoupleDto } from './dto/onboarding.dto';
import { UploadService } from '../upload/upload.service';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    private uploadService: UploadService,
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

    // 1. Get all memories to delete their photos from S3
    const memories = await this.memoryModel.find({ coupleId });
    const photoKeys: string[] = [];
    memories.forEach((memory) => {
      if (memory.photos && memory.photos.length > 0) {
        memory.photos.forEach((photo: any) => {
          const key = typeof photo === 'string' ? photo : photo.url;
          if (key) photoKeys.push(key);
        });
      }
    });

    // 2. Add user avatars to delete list if they exist
    const partners = await this.userModel.find({ coupleId });
    partners.forEach((p) => {
      if (p.avatar) {
        const key = typeof p.avatar === 'string' ? p.avatar : p.avatar.url;
        if (key && !key.startsWith('http')) {
          photoKeys.push(key);
        }
      }
    });

    // 3. Delete all files from S3
    if (photoKeys.length > 0) {
      await Promise.all(
        photoKeys.map((key) => this.uploadService.deleteFile(key)),
      );
    }

    // 4. Delete all memories from DB
    await this.memoryModel.deleteMany({ coupleId });

    // 5. Delete all users associated with this couple
    await this.userModel.deleteMany({ coupleId });

    // 6. Delete the couple record itself
    await this.coupleModel.findByIdAndDelete(coupleId);

    return { success: true };
  }
}
