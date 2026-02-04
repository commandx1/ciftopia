import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TimeCapsuleService } from './time-capsule.service';
import {
  CreateTimeCapsuleDto,
  UpdateTimeCapsuleDto,
  AddReflectionDto,
} from './dto/time-capsule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoupleDocument } from 'src/schemas/couple.schema';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    coupleId: CoupleDocument;
    [key: string]: any;
  };
}
@Controller('time-capsule')
@UseGuards(JwtAuthGuard)
export class TimeCapsuleController {
  constructor(private readonly timeCapsuleService: TimeCapsuleService) {}

  @Post()
  create(
    @Req() req: AuthRequest,
    @Body() createTimeCapsuleDto: CreateTimeCapsuleDto,
  ) {
    return this.timeCapsuleService.create(req.user._id, createTimeCapsuleDto);
  }

  @Post(':id/reflection')
  addReflection(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: AddReflectionDto,
  ) {
    return this.timeCapsuleService.addReflection(id, req.user._id, dto);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.timeCapsuleService.findAllByCoupleId(req.user.coupleId);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.timeCapsuleService.findOne(id, req.user._id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() updateTimeCapsuleDto: UpdateTimeCapsuleDto,
  ) {
    return this.timeCapsuleService.update(
      id,
      req.user._id,
      updateTimeCapsuleDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.timeCapsuleService.remove(id, req.user._id);
  }
}
