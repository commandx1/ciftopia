import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Post('create-couple')
  async createCouple(
    @Req() req: any,
    @Body() createCoupleDto: CreateCoupleDto,
  ) {
    const result = await this.onboardingService.createCouple(req.user._id, createCoupleDto);
    return { success: true, data: result };
  }
}
