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
import { GalleryService } from './gallery.service';
import {
  CreateAlbumDto,
  UploadPhotosDto,
  UpdateAlbumDto,
} from './dto/gallery.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoupleOwnerGuard } from '../auth/guards/couple-owner.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get(':subdomain/albums')
  @UseGuards(JwtAuthGuard, CoupleOwnerGuard)
  async getAlbums(@Param('subdomain') subdomain: string) {
    return this.galleryService.findAllAlbumsBySubdomain(subdomain);
  }

  @Get(':subdomain/photos')
  @UseGuards(JwtAuthGuard, CoupleOwnerGuard)
  async getAllPhotos(@Param('subdomain') subdomain: string) {
    return this.galleryService.findAllPhotosBySubdomain(subdomain);
  }

  @Get('albums/:id')
  @UseGuards(JwtAuthGuard)
  async getAlbum(@Param('id') id: string) {
    return this.galleryService.findAlbumById(id);
  }

  @Get('albums/:id/photos')
  @UseGuards(JwtAuthGuard)
  async getAlbumPhotos(@Param('id') id: string) {
    return this.galleryService.findPhotosByAlbum(id);
  }

  @Post('albums')
  @UseGuards(JwtAuthGuard)
  async createAlbum(
    @Req() req: AuthRequest,
    @Body() createAlbumDto: CreateAlbumDto,
  ) {
    return this.galleryService.createAlbum(req.user._id, createAlbumDto);
  }

  @Post('photos')
  @UseGuards(JwtAuthGuard)
  async uploadPhotos(
    @Req() req: AuthRequest,
    @Body() uploadDto: UploadPhotosDto,
  ) {
    return this.galleryService.uploadPhotos(req.user._id, uploadDto);
  }

  @Patch('albums/:id')
  @UseGuards(JwtAuthGuard)
  async updateAlbum(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateDto: UpdateAlbumDto,
  ) {
    return this.galleryService.updateAlbum(req.user._id, id, updateDto);
  }

  @Delete('albums/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAlbum(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.galleryService.deleteAlbum(req.user._id, id);
  }

  @Delete('photos/:id')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.galleryService.deletePhoto(req.user._id, id);
  }
}
