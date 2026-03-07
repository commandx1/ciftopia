import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MemoriesService } from './memories.service';
import { CreateMemoryDto, GenerateNovelDto } from './dto/memories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoupleOwnerGuard } from '../auth/guards/couple-owner.guard';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
  coupleId?: string;
}

@Controller('memories')
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Get('for-story')
  @UseGuards(JwtAuthGuard)
  async getMemoriesForStory(@Req() req: AuthRequest) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.memoriesService.findForStoryList(coupleId.toString());
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMemories(
    @Req() req: AuthRequest,
    @Query('mood') mood?: string,
    @Query('sortBy') sortBy?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('onlyFavorites') onlyFavorites?: string,
  ) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.memoriesService.findAllByCoupleId(coupleId.toString(), {
      mood,
      sortBy,
      limit: limit ? parseInt(limit) : 5,
      skip: skip ? parseInt(skip) : 0,
      userId: req.user._id,
      onlyFavorites,
    } as any);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createMemory(
    @Req() req: AuthRequest,
    @Body() createMemoryDto: CreateMemoryDto,
  ) {
    const result = await this.memoriesService.create(
      req.user._id,
      createMemoryDto,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateMemory(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateMemoryDto: Partial<CreateMemoryDto>,
  ) {
    return this.memoriesService.update(req.user._id, id, updateMemoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/toggle-favorite')
  async toggleFavorite(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.memoriesService.toggleFavorite(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/generate-song')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateSong(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.memoriesService.generateSong(req.user._id, id);
  }

  @Get('stories')
  @UseGuards(JwtAuthGuard)
  async getStories(@Req() req: AuthRequest) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.memoriesService.findStoriesByCoupleId(coupleId.toString());
  }

  @Get('story/:id')
  @UseGuards(JwtAuthGuard)
  async getStory(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.memoriesService.getStory(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-novel')
  async generateNovel(@Req() req: AuthRequest, @Body() dto: GenerateNovelDto) {
    return this.memoriesService.generateNovel(req.user._id, dto.memoryIds);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export-pdf')
  async exportPdf(@Req() req: AuthRequest, @Res() res: Response) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    const pdfBuffer = await this.memoriesService.exportAsPdf(coupleId.toString());

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Anilarimiz.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMemory(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.memoriesService.delete(req.user._id, id);
  }
}
