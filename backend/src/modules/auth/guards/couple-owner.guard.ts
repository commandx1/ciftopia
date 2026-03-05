import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Couple, CoupleDocument } from '../../../schemas/couple.schema';

@Injectable()
export class CoupleOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by JwtAuthGuard

    if (!user) {
      throw new ForbiddenException('Oturum açmanız gerekiyor.');
    }

    const coupleId = user.coupleId?._id ?? user.coupleId;
    if (!coupleId) {
      throw new ForbiddenException('Çift hesabı bulunamadı.');
    }

    const targetCouple = await this.coupleModel.findById(coupleId);
    if (!targetCouple) {
      throw new NotFoundException('Çift hesabı bulunamadı.');
    }

    const userId = new Types.ObjectId(user._id);
    const isPartner1 = targetCouple.partner1.equals(userId);
    const isPartner2 =
      targetCouple.partner2 && targetCouple.partner2.equals(userId);

    if (!isPartner1 && !isPartner2) {
      throw new ForbiddenException(
        'Bu çift sayfasına erişim yetkiniz bulunmuyor.',
      );
    }

    request.coupleId = targetCouple._id;
    return true;
  }
}
