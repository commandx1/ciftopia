import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() createFeedbackDto: CreateFeedbackDto) {
    return this.feedbackService.create(
      req.user._id.toString(),
      req.user.coupleId._id.toString(),
      createFeedbackDto,
    );
  }

  @Get('stats')
  async getStats() {
    return this.feedbackService.getStats();
  }
}
