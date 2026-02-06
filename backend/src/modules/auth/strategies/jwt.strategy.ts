import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import { UploadService } from '../../upload/upload.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private uploadService: UploadService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          return request?.cookies?.accessToken;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    const { sub: id, coupleNames } = payload;
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .populate({
        path: 'coupleId',
        populate: [
          { path: 'partner1', select: 'firstName lastName email avatar gender' },
          { path: 'partner2', select: 'firstName lastName email avatar gender' },
        ],
      });

    if (!user) {
      throw new UnauthorizedException();
    }

    const userObj = user.toObject() as any;

    await this.uploadService.transformAvatar(userObj);

    if (userObj.coupleId) {
      if (userObj.coupleId.partner1) await this.uploadService.transformAvatar(userObj.coupleId.partner1);
      if (userObj.coupleId.partner2) await this.uploadService.transformAvatar(userObj.coupleId.partner2);
    }

    // Token içindeki coupleNames'i user objesine ekle (frontend'de me isteğiyle ulaşabilmek için)
    if (coupleNames) {
      (userObj as any).coupleNames = coupleNames;
    }

    return userObj;
  }
}
