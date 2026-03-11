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
import { NotificationService } from '../notification/notification.service';
import { EncryptionService } from '../security/security.service';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<NoteDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private activityService: ActivityService,
    private notificationService: NotificationService,
    private encryptionService: EncryptionService,
  ) {}

  private async decryptNoteObject(note: any) {
    const coupleId = note?.coupleId?.toString?.() || note?.coupleId;
    if (!coupleId) return note;
    note.content = await this.encryptionService.decryptForCouple(
      coupleId,
      note.content,
    );
    return note;
  }

  async findAllByCoupleId(coupleId: string) {
    const notes = await this.noteModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ createdAt: -1 })
      .exec();

    const decrypted = await Promise.all(
      notes.map((note) =>
        this.decryptNoteObject(note.toObject ? note.toObject() : note),
      ),
    );
    return decrypted;
  }

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const encryptedContent = await this.encryptionService.encryptForCouple(
      user.coupleId.toString(),
      createNoteDto.content,
    );
    const note = new this.noteModel({
      ...createNoteDto,
      content: encryptedContent,
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
      metadata: { content: createNoteDto.content.substring(0, 50) },
    });

    // Send notification to partner
    this.notificationService.sendToPartner(
      userId,
      'Yeni Bir Not! 📝',
      `${user.firstName} senin için bir not bıraktı: "${createNoteDto.content.substring(0, 50)}${createNoteDto.content.length > 50 ? '...' : ''}"`,
      { screen: 'notes' },
    );

    const populated = await savedNote.populate(
      'authorId',
      'firstName lastName avatar gender',
    );
    return this.decryptNoteObject(
      populated.toObject ? populated.toObject() : populated,
    );
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

    const { content, ...rest } = updateNoteDto;
    if (content !== undefined) {
      note.content = await this.encryptionService.encryptForCouple(
        note.coupleId.toString(),
        content,
      );
    }
    Object.assign(note, rest);
    const updatedNote = await note.save();

    const author = await this.userModel.findById(userId);
    const decryptedContent =
      content !== undefined
        ? content
        : await this.encryptionService.decryptForCouple(
            updatedNote.coupleId.toString(),
            updatedNote.content,
          );
    await this.activityService.logActivity({
      userId,
      coupleId: updatedNote.coupleId.toString(),
      module: 'notes',
      actionType: 'update',
      resourceId: noteId,
      description: `${author?.firstName || 'Biri'} bir notu güncelledi.`,
      metadata: { content: decryptedContent.substring(0, 50) },
    });

    const populated = await updatedNote.populate(
      'authorId',
      'firstName lastName avatar gender',
    );
    return this.decryptNoteObject(
      populated.toObject ? populated.toObject() : populated,
    );
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
    const saved = await note.save();
    return this.decryptNoteObject(saved.toObject ? saved.toObject() : saved);
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
    return this.decryptNoteObject(note.toObject ? note.toObject() : note);
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
