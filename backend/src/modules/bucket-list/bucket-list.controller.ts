import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BucketListService } from './bucket-list.service';
import {
  CreateBucketListItemDto,
  UpdateBucketListItemDto,
} from './dto/bucket-list.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoupleOwnerGuard } from '../auth/guards/couple-owner.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    coupleId: { _id: string };
    [key: string]: any;
  };
}

@Controller('bucket-list')
@UseGuards(JwtAuthGuard)
export class BucketListController {
  constructor(private readonly bucketListService: BucketListService) {}

  @Get()
  async getBucketList(@Req() req: AuthRequest) {
    const coupleId = req.user.coupleId?._id || req.user.coupleId;
    return this.bucketListService.findAllByCoupleId(coupleId.toString());
  }

  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body() createDto: CreateBucketListItemDto,
  ) {
    return this.bucketListService.create(
      req.user._id,
      req.user.coupleId._id.toString(),
      createDto,
    );
  }

  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateDto: UpdateBucketListItemDto,
  ) {
    return this.bucketListService.update(req.user._id, id, updateDto);
  }

  @Delete(':id')
  async delete(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.bucketListService.delete(req.user._id, id);
  }
}
