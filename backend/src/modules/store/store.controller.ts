import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SyncSubscriptionDto } from './dto/sync-subscription.dto';

interface AuthRequest extends Request {
  user: { _id: string; coupleId: { _id: string }; [key: string]: any };
}

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('plans')
  async getPlans() {
    return this.storeService.getPlans();
  }

  @Post('sync-subscription')
  async syncSubscription(@Req() req: AuthRequest, @Body() dto: SyncSubscriptionDto) {
    const coupleId = req.user.coupleId?._id ?? req.user.coupleId;
    if (!coupleId) {
      return { success: false, message: 'Çift hesabı bulunamadı.' };
    }
    return this.storeService.syncSubscription(coupleId.toString(), dto);
  }
}

