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
    const subdomain = request.params.subdomain || request.query.subdomain;

    if (!user) {
      throw new ForbiddenException('Oturum açmanız gerekiyor.');
    }

    // If there is no subdomain in the request, we can't check ownership against a subdomain.
    // This guard is specifically for routes that deal with a subdomain.
    if (!subdomain) {
      return true;
    }

    // Find the couple associated with this subdomain
    const targetCouple = await this.coupleModel.findOne({
      subdomain: subdomain.toLowerCase(),
    });

    if (!targetCouple) {
      throw new NotFoundException('Böyle bir çift sayfası bulunamadı.');
    }

    // Check if the current user is one of the partners of this couple
    const userId = new Types.ObjectId(user._id);
    const isPartner1 = targetCouple.partner1.equals(userId);
    const isPartner2 =
      targetCouple.partner2 && targetCouple.partner2.equals(userId);

    if (!isPartner1 && !isPartner2) {
      throw new ForbiddenException(
        'Bu çift sayfasına erişim yetkiniz bulunmuyor.',
      );
    }

    // Add coupleId to request for convenience in controllers
    request.coupleId = targetCouple._id;

    return true;
  }
}
