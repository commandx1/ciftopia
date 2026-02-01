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
@UseGuards(JwtAuthGuard)
export class ImportantDatesController {
  constructor(private readonly importantDatesService: ImportantDatesService) {}

  @Get()
  findAll(@Req() req: AuthRequest) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.importantDatesService.findAllByCoupleId(coupleId.toString());
  }

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createDto: CreateImportantDateDto,
  ) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.importantDatesService.create(coupleId.toString(), req.user._id, createDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() updateDto: UpdateImportantDateDto,
  ) {
    return this.importantDatesService.update(id, req.user._id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.importantDatesService.delete(id, req.user._id);
  }
}
