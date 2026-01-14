import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ImportantDatesService } from './important-dates.service';
import { CreateImportantDateDto, UpdateImportantDateDto } from './dto/important-date.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('important-dates')
export class ImportantDatesController {
  constructor(private readonly importantDatesService: ImportantDatesService) {}

  @Get(':subdomain')
  findAll(@Param('subdomain') subdomain: string) {
    return this.importantDatesService.findAllBySubdomain(subdomain);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':subdomain')
  create(
    @Param('subdomain') subdomain: string,
    @Req() req: AuthRequest,
    @Body() createDto: CreateImportantDateDto,
  ) {
    return this.importantDatesService.create(subdomain, req.user._id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() updateDto: UpdateImportantDateDto,
  ) {
    return this.importantDatesService.update(id, req.user._id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.importantDatesService.delete(id, req.user._id);
  }
}
