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
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNotePositionDto } from './dto/notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoupleOwnerGuard } from '../auth/guards/couple-owner.guard';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get(':subdomain')
  @UseGuards(JwtAuthGuard, CoupleOwnerGuard)
  async getNotes(@Param('subdomain') subdomain: string) {
    return this.notesService.findAllBySubdomain(subdomain);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createNote(
    @Req() req: AuthRequest,
    @Body() createNoteDto: CreateNoteDto,
  ) {
    return this.notesService.create(req.user._id, createNoteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateNote(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateNoteDto: Partial<CreateNoteDto>,
  ) {
    return this.notesService.update(req.user._id, id, updateNoteDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/position')
  async updatePosition(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() position: UpdateNotePositionDto,
  ) {
    return this.notesService.updatePosition(req.user._id, id, position);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.markAsRead(req.user._id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteNote(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.notesService.delete(req.user._id, id);
  }
}

