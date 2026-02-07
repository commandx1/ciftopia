import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { MoodService } from './mood.service';
import { CreateMoodDto } from './dto/mood.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    coupleId: any;
    [key: string]: any;
  };
}

@Controller('mood')
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  async saveMood(
    @Req() req: AuthRequest,
    @Body() createMoodDto: CreateMoodDto,
  ) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.moodService.createOrUpdateMood(
      req.user._id,
      coupleId.toString(),
      createMoodDto,
    );
  }

  @Get('monthly')
  async getMonthlyMoods(
    @Req() req: AuthRequest,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);
    return this.moodService.getMonthlyStats(coupleId.toString(), y, m);
  }

  @Get('notes')
  async getPagedNotes(
    @Req() req: AuthRequest,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    return this.moodService.getPagedNotes(coupleId.toString(), p, l);
  }
}
