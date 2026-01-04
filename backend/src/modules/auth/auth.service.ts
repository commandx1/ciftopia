import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UploadService } from '../upload/upload.service';
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private jwtService: JwtService,
    private uploadService: UploadService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, gender, avatar } =
      registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
      avatar,
      role: 'partner1', // First person to register is partner1
    });

    await user.save();

    const token = await this.generateToken(user);

    const userResponse = user.toObject();
    const { password: _password, ...result } = userResponse;

    // Transform avatar to URL if exists
    if (result.avatar && (result.avatar as any).url) {
      result.avatar = {
        ...(result.avatar as any),
        url: await this.uploadService.getPresignedUrl((result.avatar as any).url),
      };
    }

    return {
      user: result,
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, subdomain } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Geçersiz bilgiler.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz bilgiler.');
    }

    // Subdomain ownership validation during login
    if (subdomain && subdomain !== 'app' && subdomain !== 'www') {
      const couple = await this.coupleModel.findOne({
        $or: [{ partner1: user._id }, { partner2: user._id }],
      });

      if (
        !couple ||
        couple.subdomain.toLowerCase() !== subdomain.toLowerCase()
      ) {
        throw new ForbiddenException('Geçersiz bilgiler.');
      }
    }

    const token = await this.generateToken(user);

    const userResponse = user.toObject();
    const { password: _password, ...result } = userResponse;

    // Transform avatar to URL if exists
    if (result.avatar && (result.avatar as any).url) {
      result.avatar = {
        ...(result.avatar as any),
        url: await this.uploadService.getPresignedUrl((result.avatar as any).url),
      };
    }

    return {
      user: result,
      accessToken: token,
    };
  }

  private async generateToken(user: UserDocument) {
    let subdomain: string | undefined;
    let coupleNames: string | undefined;

    if (user.coupleId) {
      const couple = await this.coupleModel
        .findById(user.coupleId)
        .populate('partner1')
        .populate('partner2');
      if (couple) {
        subdomain = couple.subdomain;
        const p1 = couple.partner1 as unknown as UserDocument;
        const p2 = couple.partner2 as unknown as UserDocument;
        if (p1 && p2) {
          coupleNames = `${capitalizeFirstLetter(p1.firstName)} & ${capitalizeFirstLetter(p2.firstName)}`;
        }
      }
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      coupleId: user.coupleId,
      subdomain: subdomain,
      coupleNames: coupleNames, // Token içine eklendi
    };
    return this.jwtService.sign(payload);
  }
}
