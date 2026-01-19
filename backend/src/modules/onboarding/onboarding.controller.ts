import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateCoupleDto } from './dto/onboarding.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('check-subdomain')
  async checkSubdomain(@Query('subdomain') subdomain: string) {
    const result = await this.onboardingService.checkSubdomain(subdomain);
    return { success: true, data: result };
  }

  @Get('early-bird-status')
  async getEarlyBirdStatus() {
    const result = await this.onboardingService.getEarlyBirdStatus();
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-couple')
  async createCouple(
    @Req() req: any,
    @Body() createCoupleDto: CreateCoupleDto,
  ) {
    const userId = req.user._id.toString();
    const result = await this.onboardingService.createCouple(
      userId,
      createCoupleDto,
    );
    return { success: true, data: result };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('site')
  async deleteSite(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const userId = req.user._id.toString();
    const result = await this.onboardingService.deleteSite(userId);

    // Clear the auth cookie since the user is now deleted
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN || '.ciftopia.local',
      path: '/',
    });

    return { success: true, data: result };
  }
}
