import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Note, NoteDocument } from '../../schemas/note.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateNoteDto, UpdateNotePositionDto } from './dto/notes.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private activityService: ActivityService,
  ) {}

  async findAllBySubdomain(subdomain: string) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) {
      throw new NotFoundException('Çift bulunamadı');
    }

    const notes = await this.noteModel
      .find({ coupleId: couple._id })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ createdAt: -1 })
      .exec();

    return notes;
  }

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const note = new this.noteModel({
      ...createNoteDto,
      authorId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
    });

    const savedNote = await note.save();

    await this.activityService.logActivity({
      userId,
      coupleId: user.coupleId.toString(),
      module: 'notes',
      actionType: 'create',
      resourceId: savedNote._id.toString(),
      description: `${user.firstName} panoya yeni bir not bıraktı.`,
      metadata: { content: savedNote.content.substring(0, 50) },
    });

    return savedNote.populate('authorId', 'firstName lastName avatar gender');
  }

  async update(
    userId: string,
    noteId: string,
    updateNoteDto: Partial<CreateNoteDto>,
  ) {
    const note = await this.noteModel.findById(noteId);
    if (!note) {
      throw new NotFoundException('Not bulunamadı');
    }

    if (note.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu notu düzenleme yetkiniz yok');
    }

    Object.assign(note, updateNoteDto);
    const updatedNote = await note.save();

    const author = await this.userModel.findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: updatedNote.coupleId.toString(),
      module: 'notes',
      actionType: 'update',
      resourceId: noteId,
      description: `${author?.firstName || 'Biri'} bir notu güncelledi.`,
      metadata: { content: updatedNote.content.substring(0, 50) },
    });

    return updatedNote.populate('authorId', 'firstName lastName avatar gender');
  }

  async updatePosition(
    userId: string,
    noteId: string,
    position: UpdateNotePositionDto,
  ) {
    const note = await this.noteModel.findById(noteId);
    if (!note) throw new NotFoundException('Not bulunamadı');

    const user = await this.userModel.findById(userId);
    if (
      !user ||
      !user.coupleId ||
      note.coupleId.toString() !== user.coupleId.toString()
    ) {
      throw new ForbiddenException('Bu notun konumunu değiştirme yetkiniz yok');
    }

    note.position = position;
    return note.save();
  }

  async markAsRead(userId: string, noteId: string) {
    const note = await this.noteModel.findById(noteId);
    if (!note) throw new NotFoundException('Not bulunamadı');

    const user = await this.userModel.findById(userId);
    if (
      !user ||
      !user.coupleId ||
      note.coupleId.toString() !== user.coupleId.toString()
    ) {
      throw new ForbiddenException('Bu notu okundu işaretleme yetkiniz yok');
    }

    // Only mark as read if the current user is NOT the author
    if (note.authorId.toString() !== userId.toString()) {
      note.isRead = true;
      note.readAt = new Date();
      await note.save();
    }
    return note;
  }

  async delete(userId: string, noteId: string) {
    const note = await this.noteModel.findById(noteId);
    if (!note) {
      throw new NotFoundException('Not bulunamadı');
    }

    const user = await this.userModel.findById(userId);
    if (!user || note.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu notu silme yetkiniz yok');
    }

    const coupleId = note.coupleId;
    await this.noteModel.findByIdAndDelete(noteId);

    const author = await this.userModel.findById(userId);
    await this.activityService.logActivity({
      userId,
      coupleId: coupleId.toString(),
      module: 'notes',
      actionType: 'delete',
      description: `${author?.firstName || 'Biri'} bir notu sildi.`,
    });

    return { success: true };
  }
}
