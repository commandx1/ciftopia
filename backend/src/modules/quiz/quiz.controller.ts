import { Controller, Post, Get, Body, UseGuards, Req, Param, BadRequestException } from '@nestjs/common';
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

  @Get('recent')
  async getRecent(@Req() req: any) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) return [];
    return this.quizService.getRecentSessions(coupleId);
  }

  @Get('active')
  async getActive(@Req() req: any) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    if (!coupleId) return null;
    return this.quizService.getActiveSession(coupleId);
  }
}
