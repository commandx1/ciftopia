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
} from '@nestjs/common';
import { PoemsService } from './poems.service';
import { CreatePoemDto } from './dto/poems.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoupleOwnerGuard } from '../auth/guards/couple-owner.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('poems')
export class PoemsController {
  constructor(private readonly poemsService: PoemsService) {}

  @Get('public/examples')
  async getPublicPoems(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.poemsService.findPublicPoems(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 9,
    );
  }

  @Get(':subdomain')
  @UseGuards(JwtAuthGuard, CoupleOwnerGuard)
  async getPoems(
    @Param('subdomain') subdomain: string,
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.poemsService.findAllBySubdomain(
      subdomain,
      {
        tag,
        authorId: author,
      },
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 9,
    );
  }

  @Get(':subdomain/tags')
  @UseGuards(JwtAuthGuard, CoupleOwnerGuard)
  async getTags(@Param('subdomain') subdomain: string) {
    return this.poemsService.getDistinctTags(subdomain);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPoem(
    @Req() req: AuthRequest,
    @Body() createPoemDto: CreatePoemDto,
  ) {
    return this.poemsService.create(req.user._id, createPoemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePoem(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updatePoemDto: Partial<CreatePoemDto>,
  ) {
    return this.poemsService.update(req.user._id, id, updatePoemDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePoem(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.poemsService.delete(req.user._id, id);
  }
}

