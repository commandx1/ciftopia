import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      domain: process.env.NODE_ENV === 'production' ? '.ciftopia.com' : 'localhost',
      path: '/',
    });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return { success: true, data: { user: req.user } };
  }

  private setCookie(res: Response, token: string) {
    const domain = process.env.NODE_ENV === 'production' ? '.ciftopia.com' : 'localhost';
    
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: domain,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
