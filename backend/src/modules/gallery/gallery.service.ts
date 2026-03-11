import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album, AlbumDocument } from '../../schemas/album.schema';
import {
  GalleryPhoto,
  GalleryPhotoDocument,
} from '../../schemas/gallery-photo.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import {
  CreateAlbumDto,
  UploadPhotosDto,
  UpdateAlbumDto,
} from './dto/gallery.dto';
import { UploadService } from '../upload/upload.service';
import { ActivityService } from '../activity/activity.service';
import { EncryptionService } from '../security/security.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(GalleryPhoto.name)
    private photoModel: Model<GalleryPhotoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
    private activityService: ActivityService,
    private encryptionService: EncryptionService,
  ) {}

  private getCoupleIdValue(value: any): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (value instanceof Types.ObjectId) return value.toString();
    if (value._id) {
      if (typeof value._id === 'string') return value._id;
      if (value._id?.toString) return value._id.toString();
    }
    if (value.toString) return value.toString();
    return undefined;
  }

  private async decryptAlbumObject(album: any) {
    const coupleId = this.getCoupleIdValue(album?.coupleId);
    if (!coupleId) return album;
    if (album.title) {
      album.title = await this.encryptionService.decryptForCouple(
        coupleId,
        album.title,
      );
    }
    if (album.description) {
      album.description = await this.encryptionService.decryptForCouple(
        coupleId,
        album.description,
      );
    }
    return album;
  }

  private async decryptPhotoObject(photo: any) {
    const coupleId = this.getCoupleIdValue(photo?.coupleId);
    if (!coupleId) return photo;
    if (photo.caption) {
      photo.caption = await this.encryptionService.decryptForCouple(
        coupleId,
        photo.caption,
      );
    }
    return photo;
  }

  private async transformAlbum(
    albums: AlbumDocument | AlbumDocument[],
  ): Promise<any> {
    const isArray = Array.isArray(albums);
    const albumList = isArray
      ? (albums as AlbumDocument[])
      : [albums as AlbumDocument];

    const transformed = await Promise.all(
      albumList.map(async (album) => {
        const albumObj = album.toObject ? album.toObject() : album;
        if (albumObj.coverPhoto && albumObj.coverPhoto.url) {
          albumObj.coverPhoto.url = await this.uploadService.getPresignedUrl(
            albumObj.coverPhoto.url as string,
          );
        }
        return this.decryptAlbumObject(albumObj);
      }),
    );

    return isArray ? transformed : transformed[0];
  }

  private async transformPhotos(
    photos: GalleryPhotoDocument | GalleryPhotoDocument[],
  ): Promise<any> {
    const isArray = Array.isArray(photos);
    const photoList = isArray
      ? (photos as GalleryPhotoDocument[])
      : [photos as GalleryPhotoDocument];

    const transformed = await Promise.all(
      photoList.map(async (photo) => {
        const photoObj = photo.toObject ? photo.toObject() : photo;
        if (photoObj.photo && photoObj.photo.url) {
          photoObj.photo.url = await this.uploadService.getPresignedUrl(
            photoObj.photo.url as string,
          );
        }
        return this.decryptPhotoObject(photoObj);
      }),
    );

    return isArray ? transformed : transformed[0];
  }

  async findAllAlbumsByCoupleId(coupleId: string) {
    const albums = await this.albumModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .populate({
        path: 'coupleId',
        populate: [
          { path: 'partner1', select: 'firstName lastName avatar gender' },
          { path: 'partner2', select: 'firstName lastName avatar gender' },
        ],
      })
      .sort({ date: -1 })
      .exec();

    const transformedAlbums = (await this.transformAlbum(albums)) as any[];

    // Transform partner avatars for each album
    for (const albumObj of transformedAlbums) {
      if (albumObj.coupleId) {
        if (albumObj.coupleId.partner1?.avatar) {
          const p1Avatar = albumObj.coupleId.partner1.avatar;
          albumObj.coupleId.partner1.avatar = {
            ...p1Avatar,
            url: await this.uploadService.getPresignedUrl(p1Avatar.url),
          };
        }
        if (albumObj.coupleId.partner2?.avatar) {
          const p2Avatar = albumObj.coupleId.partner2.avatar;
          albumObj.coupleId.partner2.avatar = {
            ...p2Avatar,
            url: await this.uploadService.getPresignedUrl(p2Avatar.url),
          };
        }
      }
    }

    const couple = await this.coupleModel.findById(coupleId);

    return {
      albums: transformedAlbums,
      storageUsed: couple?.storageUsed || 0,
      storageLimit: couple?.storageLimit || 0,
    };
  }

  async findAlbumById(albumId: string) {
    const album = await this.albumModel
      .findById(albumId)
      .populate('authorId', 'firstName lastName avatar gender')
      .populate({
        path: 'coupleId',
        populate: [
          { path: 'partner1', select: 'firstName lastName avatar gender' },
          { path: 'partner2', select: 'firstName lastName avatar gender' },
        ],
      })
      .exec();

    if (!album) throw new NotFoundException('Albüm bulunamadı');

    const albumObj = (await this.transformAlbum(album)) as any;

    // Transform partner avatars
    if (albumObj.coupleId) {
      if (albumObj.coupleId.partner1?.avatar) {
        const p1Avatar = albumObj.coupleId.partner1.avatar;
        albumObj.coupleId.partner1.avatar = {
          ...p1Avatar,
          url: await this.uploadService.getPresignedUrl(p1Avatar.url),
        };
      }
      if (albumObj.coupleId.partner2?.avatar) {
        const p2Avatar = albumObj.coupleId.partner2.avatar;
        albumObj.coupleId.partner2.avatar = {
          ...p2Avatar,
          url: await this.uploadService.getPresignedUrl(p2Avatar.url),
        };
      }
    }

    return albumObj;
  }

  async findPhotosByAlbum(albumId: string) {
    const photos = await this.photoModel
      .find({ albumId: new Types.ObjectId(albumId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ createdAt: -1 })
      .exec();

    return (await this.transformPhotos(photos)) as any[];
  }

  async findAllPhotosByCoupleId(coupleId: string) {
    const photos = await this.photoModel
      .find({ coupleId: new Types.ObjectId(coupleId) })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ createdAt: -1 })
      .exec();

    const transformedPhotos = (await this.transformPhotos(photos)) as any[];
    const couple = await this.coupleModel.findById(coupleId);

    return {
      photos: transformedPhotos,
      storageUsed: couple?.storageUsed || 0,
      storageLimit: couple?.storageLimit || 0,
    };
  }

  async createAlbum(userId: string, createAlbumDto: CreateAlbumDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const encryptedTitle = await this.encryptionService.encryptForCouple(
      user.coupleId.toString(),
      createAlbumDto.title,
    );
    const encryptedDescription =
      createAlbumDto.description !== undefined
        ? await this.encryptionService.encryptForCouple(
            user.coupleId.toString(),
            createAlbumDto.description,
          )
        : undefined;

    const album = new this.albumModel({
      ...createAlbumDto,
      title: encryptedTitle,
      description: encryptedDescription,
      authorId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
    });

    const savedAlbum = await album.save();
    const populated = await savedAlbum.populate('authorId', 'firstName lastName avatar gender');

    await this.activityService.logActivity({
      userId,
      coupleId: user.coupleId.toString(),
      module: 'gallery',
      actionType: 'create',
      resourceId: populated._id.toString(),
      description: `${user.firstName} galeriye "${populated.title}" isimli yeni bir albüm ekledi.`,
      metadata: { albumTitle: populated.title },
    });

    return await this.transformAlbum(populated);
  }

  async uploadPhotos(userId: string, uploadDto: UploadPhotosDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    const encryptedCaption =
      uploadDto.caption !== undefined
        ? await this.encryptionService.encryptForCouple(
            user.coupleId.toString(),
            uploadDto.caption,
          )
        : undefined;

    const photoData = uploadDto.photos.map((p: any) => ({
      photo: p,
      caption: encryptedCaption,
      albumId: uploadDto.albumId
        ? new Types.ObjectId(uploadDto.albumId)
        : undefined,
      authorId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
    }));

    const savedPhotos = await this.photoModel.insertMany(photoData);

    // Update album photo count and cover photo if it's the first photo
    let albumTitle = '';
    if (uploadDto.albumId) {
      const album = await this.albumModel.findById(uploadDto.albumId);
      if (album) {
        albumTitle = await this.encryptionService.decryptForCouple(
          user.coupleId.toString(),
          album.title,
        );
        album.photoCount += savedPhotos.length;
        if (!album.coverPhoto && savedPhotos.length > 0) {
          album.coverPhoto = (savedPhotos[0] as any).photo;
        }
        await album.save();
      }
    }

    await this.activityService.logActivity({
      userId,
      coupleId: user.coupleId.toString(),
      module: 'gallery',
      actionType: 'create',
      description: `${user.firstName} ${albumTitle ? `"${albumTitle}" albümüne ` : ''}${savedPhotos.length} yeni fotoğraf ekledi.`,
      metadata: { photoCount: savedPhotos.length, albumId: uploadDto.albumId },
    });

    const transformedPhotos = (await this.transformPhotos(
      savedPhotos as any,
    )) as any[];

    return {
      photos: transformedPhotos,
      storageUsed: couple.storageUsed,
      storageLimit: couple.storageLimit,
    };
  }

  async updateAlbum(
    userId: string,
    albumId: string,
    updateDto: UpdateAlbumDto,
  ) {
    const album = await this.albumModel.findById(albumId);
    if (!album) throw new NotFoundException('Albüm bulunamadı');

    if (album.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu albümü düzenleme yetkiniz yok');
    }

    const oldTitle = await this.encryptionService.decryptForCouple(
      album.coupleId.toString(),
      album.title,
    );
    const { title, description, ...rest } = updateDto;
    if (title !== undefined) {
      album.title = await this.encryptionService.encryptForCouple(
        album.coupleId.toString(),
        title,
      );
    }
    if (description !== undefined) {
      album.description = await this.encryptionService.encryptForCouple(
        album.coupleId.toString(),
        description,
      );
    }
    Object.assign(album, rest);
    const updatedAlbum = await album.save();
    const populated = await updatedAlbum.populate('authorId', 'firstName lastName avatar gender');

    const user = await this.userModel.findById(userId);
    const coupleIdValue =
      this.getCoupleIdValue(populated.coupleId) || album.coupleId.toString();
    const newTitle =
      title ??
      (await this.encryptionService.decryptForCouple(
        coupleIdValue,
        populated.title,
      ));
    await this.activityService.logActivity({
      userId,
      coupleId: coupleIdValue,
      module: 'gallery',
      actionType: 'update',
      resourceId: albumId,
      description: `${user?.firstName || 'Biri'} "${oldTitle}" albümünü güncelledi.`,
      metadata: { albumId, oldTitle, newTitle },
    });

    return await this.transformAlbum(populated);
  }

  async deleteAlbum(userId: string, albumId: string) {
    const album = await this.albumModel.findById(albumId);
    if (!album) throw new NotFoundException('Albüm bulunamadı');

    const user = await this.userModel.findById(userId);
    if (!user || album.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu albümü silme yetkiniz yok');
    }

    const albumTitle = await this.encryptionService.decryptForCouple(
      album.coupleId.toString(),
      album.title,
    );

    // Delete all photos in the album from S3 and update storage
    const photos = await this.photoModel.find({ albumId: album._id });
    const totalSize = photos.reduce((sum, p) => sum + (p.photo.size || 0), 0);

    // Delete files from S3
    for (const photo of photos) {
      if (photo.photo && photo.photo.url) {
        await this.uploadService.deleteFile(photo.photo.url);
      }
    }

    await this.photoModel.deleteMany({ albumId: album._id });
    await this.albumModel.findByIdAndDelete(albumId);

    // Update couple storage
    const couple = await this.coupleModel.findById(user.coupleId);
    if (couple) {
      couple.storageUsed = Math.max(0, couple.storageUsed - totalSize);
      await couple.save();
    }

    await this.activityService.logActivity({
      userId,
      coupleId: user.coupleId!.toString(),
      module: 'gallery',
      actionType: 'delete',
      description: `${user.firstName} "${albumTitle}" albümünü ve içindeki tüm fotoğrafları sildi.`,
      metadata: { albumTitle },
    });

    return { success: true, storageUsed: couple?.storageUsed, storageLimit: couple?.storageLimit };
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.photoModel.findById(photoId);
    if (!photo) throw new NotFoundException('Fotoğraf bulunamadı');

    const user = await this.userModel.findById(userId);
    if (!user || photo.authorId.toString() !== userId.toString()) {
      throw new ForbiddenException('Bu fotoğrafı silme yetkiniz yok');
    }

    const photoSize = photo.photo.size || 0;
    const albumId = photo.albumId;

    // Delete file from S3
    if (photo.photo && photo.photo.url) {
      await this.uploadService.deleteFile(photo.photo.url);
    }

    await this.photoModel.findByIdAndDelete(photoId);

    // Update couple storage
    const couple = await this.coupleModel.findById(user.coupleId);
    if (couple) {
      couple.storageUsed = Math.max(0, couple.storageUsed - photoSize);
      await couple.save();
    }

    // Update album count
    if (albumId) {
      const album = await this.albumModel.findById(albumId);
      if (album) {
        album.photoCount = Math.max(0, album.photoCount - 1);
        // If the deleted photo was the cover photo, pick a new one
        if (album.coverPhoto?.url === photo.photo.url) {
          const nextPhoto = await this.photoModel.findOne({
            albumId: album._id,
          });
          album.coverPhoto = nextPhoto ? nextPhoto.photo : undefined;
        }
        await album.save();
      }
    }

    await this.activityService.logActivity({
      userId,
      coupleId: user.coupleId!.toString(),
      module: 'gallery',
      actionType: 'delete',
      description: `${user.firstName} bir fotoğraf sildi.`,
      metadata: { photoId },
    });

    return { success: true, storageUsed: couple?.storageUsed, storageLimit: couple?.storageLimit };
  }
}
