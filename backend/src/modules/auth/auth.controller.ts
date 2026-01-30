import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UpdateRelationshipProfileDto } from './dto/profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserDocument } from 'src/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto);
    this.setCookie(res, result.accessToken);
    return { success: true, data: result };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.setCookie(res, result.accessToken);
    return { success: true, data: result };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      domain: this.getCookieDomain(),
      path: '/',
    });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: { user: UserDocument }) {
    return { success: true, data: { user: req.user } };
  }

  @UseGuards(JwtAuthGuard)
  @Post('relationship-profile')
  async updateRelationshipProfile(
    @Req() req: { user: UserDocument },
    @Body() profileDto: UpdateRelationshipProfileDto,
  ) {
    const result = await this.authService.updateRelationshipProfile(
      req.user._id.toString(),
      profileDto,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('push-token')
  async updatePushToken(
    @Req() req: { user: UserDocument },
    @Body('pushToken') pushToken: string,
  ) {
    await this.authService.updatePushToken(req.user._id.toString(), pushToken);
    return { success: true };
  }

  private setCookie(res: Response, token: string) {
    const domain = this.getCookieDomain();

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: domain,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private getCookieDomain() {
    const host = process.env.COOKIE_DOMAIN;
    if (host) return host;

    return process.env.NODE_ENV === 'production' ? '.ciftopia.com' : undefined;
  }
}
