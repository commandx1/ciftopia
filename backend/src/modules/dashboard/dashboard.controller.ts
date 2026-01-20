import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Req() req: any) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) {
      return { success: false, message: 'Çift hesabı bulunamadı.' };
    }
    return this.dashboardService.getStats(coupleId.toString());
  }
}
