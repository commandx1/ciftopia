import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CiftoService } from './cifto.service';
import { SendCiftoMessageDto } from './dto/cifto.dto';

interface AuthRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('cifto')
export class CiftoController {
  constructor(private readonly ciftoService: CiftoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getConversation(@Req() req: AuthRequest) {
    return this.ciftoService.getConversation(req.user._id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('message')
  async sendMessage(@Req() req: AuthRequest, @Body() body: SendCiftoMessageDto) {
    return this.ciftoService.sendMessage(req.user._id, body.content);
  }
}
