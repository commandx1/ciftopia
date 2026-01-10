import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { DailyQuestionService } from './daily-question.service';
import { AnswerQuestionDto } from './dto/daily-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { CoupleDocument } from 'src/schemas/couple.schema';

interface AuthRequest extends Request {
  user: {
    _id: string;
    coupleId: CoupleDocument;
    [key: string]: any;
  };
}

@Controller('daily-question')
@UseGuards(JwtAuthGuard)
export class DailyQuestionController {
  constructor(private readonly dailyQuestionService: DailyQuestionService) {}

  @Get()
  async getTodaysQuestion(@Req() req: AuthRequest) {
    return this.dailyQuestionService.getTodaysQuestion(
      req.user._id,
      req.user.coupleId._id.toString(),
    );
  }

  @Post('answer')
  async answerQuestion(
    @Req() req: AuthRequest,
    @Body() answerDto: AnswerQuestionDto,
  ) {
    return this.dailyQuestionService.answerQuestion(
      req.user._id,
      req.user.coupleId._id.toString(),
      answerDto,
    );
  }

  @Get('stats')
  async getStats(@Req() req: AuthRequest) {
    return this.dailyQuestionService.getStats(req.user.coupleId._id.toString());
  }

  @Get('download-pdf')
  async downloadPdf(@Req() req: AuthRequest, @Res() res: Response) {
    const buffer = await this.dailyQuestionService.generateQuestionPdf(
      req.user._id,
      req.user.coupleId._id.toString(),
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Ciftopia-Gunun-Sorusu-${new Date().toISOString().split('T')[0]}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
