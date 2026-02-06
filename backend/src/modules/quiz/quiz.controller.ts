import { Controller, Post, Get, Body, UseGuards, Req, Param, BadRequestException, Query } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateQuizSessionDto } from './dto/quiz.dto';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('session')
  async createSession(@Req() req: any, @Body() createDto: CreateQuizSessionDto) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) throw new BadRequestException('Bu özellik için bir çifte bağlı olmanız gerekir.');
    return this.quizService.createSession(coupleId, createDto.category);
  }

  @Get('session/:id')
  async getSession(@Param('id') id: string) {
    return this.quizService.getSession(id);
  }

  @Get('result/:id')
  async getResult(@Param('id') id: string) {
    return this.quizService.getResultDetails(id);
  }

  @Get('recent')
  async getRecent(@Req() req: any, @Query('offset') offset: number = 0, @Query('limit') limit: number = 5) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) return [];
    return this.quizService.getRecentSessions(coupleId, Number(offset), Number(limit));
  }

  @Get('active')
  async getActive(@Req() req: any) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) return null;
    return this.quizService.getActiveSession(coupleId);
  }

  @Post('session/cancel')
  async cancelSession(@Body('sessionId') sessionId: string) {
    return this.quizService.cancelSession(sessionId);
  }

  @Post('session/notify')
  async notifyPartner(@Req() req: any) {
    const userId = req.user._id;
    const userName = req.user.firstName;
    return this.quizService.notifyPartner(userId, userName);
  }
}
