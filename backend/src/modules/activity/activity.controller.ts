import {
  Controller,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getActivities(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('module') module?: string,
  ) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) {
      throw new ForbiddenException('Bir çifte bağlı değilsiniz.');
    }
    return this.activityService.findAllByCoupleId(
      coupleId.toString(),
      parseInt(page),
      parseInt(limit),
      module,
    );
  }
}
