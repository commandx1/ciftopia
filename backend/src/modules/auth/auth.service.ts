import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

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
      role: 'partner1', // First person to register is partner1
    });

    await user.save();

    const token = this.generateToken(user);

    const userResponse = user.toObject();
    const { password: _, ...result } = userResponse;

    return {
      user: result,
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz e-posta veya şifre.');
    }

    const token = this.generateToken(user);

    const userResponse = user.toObject();
    const { password: __, ...result } = userResponse;

    return {
      user: result,
      accessToken: token,
    };
  }

  private generateToken(user: UserDocument) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      coupleId: user.coupleId,
    };
    return this.jwtService.sign(payload);
  }
}
