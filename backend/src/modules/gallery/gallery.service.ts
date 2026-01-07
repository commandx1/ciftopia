import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Album, AlbumDocument } from '../../schemas/album.schema';
import { GalleryPhoto, GalleryPhotoDocument } from '../../schemas/gallery-photo.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Couple, CoupleDocument } from '../../schemas/couple.schema';
import { CreateAlbumDto, UploadPhotosDto, UpdateAlbumDto } from './dto/gallery.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    @InjectModel(GalleryPhoto.name) private photoModel: Model<GalleryPhotoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Couple.name) private coupleModel: Model<CoupleDocument>,
    private uploadService: UploadService,
  ) {}

  private async transformAlbum(
    albums: AlbumDocument | AlbumDocument[],
  ): Promise<any> {
    const isArray = Array.isArray(albums);
    const albumList = isArray ? (albums as AlbumDocument[]) : [albums as AlbumDocument];

    const transformed = await Promise.all(
      albumList.map(async (album) => {
        const albumObj = album.toObject ? album.toObject() : album;
        if (albumObj.coverPhoto && albumObj.coverPhoto.url) {
          albumObj.coverPhoto.url = await this.uploadService.getPresignedUrl(
            albumObj.coverPhoto.url as string,
          );
        }
        return albumObj;
      }),
    );

    return isArray ? transformed : transformed[0];
  }

  private async transformPhotos(
    photos: GalleryPhotoDocument | GalleryPhotoDocument[],
  ): Promise<any> {
    const isArray = Array.isArray(photos);
    const photoList = isArray ? (photos as GalleryPhotoDocument[]) : [photos as GalleryPhotoDocument];

    const transformed = await Promise.all(
      photoList.map(async (photo) => {
        const photoObj = photo.toObject ? photo.toObject() : photo;
        if (photoObj.photo && photoObj.photo.url) {
          photoObj.photo.url = await this.uploadService.getPresignedUrl(
            photoObj.photo.url as string,
          );
        }
        return photoObj;
      }),
    );

    return isArray ? transformed : transformed[0];
  }

  async findAllAlbumsBySubdomain(subdomain: string) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    const albums = await this.albumModel
      .find({ coupleId: couple._id })
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

    return transformedAlbums;
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

  async findAllPhotosBySubdomain(subdomain: string) {
    const couple = await this.coupleModel.findOne({ subdomain });
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    const photos = await this.photoModel
      .find({ coupleId: couple._id })
      .populate('authorId', 'firstName lastName avatar gender')
      .sort({ createdAt: -1 })
      .exec();

    return (await this.transformPhotos(photos)) as any[];
  }

  async createAlbum(userId: string, createAlbumDto: CreateAlbumDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const album = new this.albumModel({
      ...createAlbumDto,
      authorId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
    });

    const savedAlbum = await album.save();
    return await this.transformAlbum(savedAlbum);
  }

  async uploadPhotos(userId: string, uploadDto: UploadPhotosDto) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.coupleId) {
      throw new ForbiddenException('Bir çift kaydı bulunamadı');
    }

    const couple = await this.coupleModel.findById(user.coupleId);
    if (!couple) throw new NotFoundException('Çift bulunamadı');

    // Calculate total size of new photos
    const totalNewSize = uploadDto.photos.reduce(
      (sum, photo) => sum + (photo.size || 0),
      0,
    );

    // Check storage limit
    if (couple.storageUsed + totalNewSize > couple.storageLimit) {
      throw new BadRequestException(
        'Yetersiz depolama alanı. Lütfen bazı dosyaları silin veya planınızı yükseltin.',
      );
    }

    const photoData = uploadDto.photos.map((p) => ({
      photo: p,
      caption: uploadDto.caption,
      albumId: uploadDto.albumId
        ? new Types.ObjectId(uploadDto.albumId)
        : undefined,
      authorId: new Types.ObjectId(userId),
      coupleId: user.coupleId,
    }));

    const savedPhotos = await this.photoModel.insertMany(photoData);

    // Update couple storage
    couple.storageUsed += totalNewSize;
    await couple.save();

    // Update album photo count and cover photo if it's the first photo
    if (uploadDto.albumId) {
      const album = await this.albumModel.findById(uploadDto.albumId);
      if (album) {
        album.photoCount += savedPhotos.length;
        if (!album.coverPhoto && savedPhotos.length > 0) {
          album.coverPhoto = (savedPhotos[0] as any).photo;
        }
        await album.save();
      }
    }

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

    if (album.authorId.toString() !== userId) {
      throw new ForbiddenException('Bu albümü düzenleme yetkiniz yok');
    }

    Object.assign(album, updateDto);
    const updatedAlbum = await album.save();
    return await this.transformAlbum(updatedAlbum);
  }

  async deleteAlbum(userId: string, albumId: string) {
    const album = await this.albumModel.findById(albumId);
    if (!album) throw new NotFoundException('Albüm bulunamadı');

    const user = await this.userModel.findById(userId);
    if (!user || album.authorId.toString() !== userId) {
      throw new ForbiddenException('Bu albümü silme yetkiniz yok');
    }

    // Delete all photos in the album and update storage
    const photos = await this.photoModel.find({ albumId: album._id });
    const totalSize = photos.reduce((sum, p) => sum + (p.photo.size || 0), 0);

    await this.photoModel.deleteMany({ albumId: album._id });
    await this.albumModel.findByIdAndDelete(albumId);

    // Update couple storage
    const couple = await this.coupleModel.findById(user.coupleId);
    if (couple) {
      couple.storageUsed = Math.max(0, couple.storageUsed - totalSize);
      await couple.save();
    }

    return { success: true, storageUsed: couple?.storageUsed };
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
          const nextPhoto = await this.photoModel.findOne({ albumId: album._id });
          album.coverPhoto = nextPhoto ? nextPhoto.photo : undefined;
        }
        await album.save();
      }
    }

    return { success: true, storageUsed: couple?.storageUsed };
  }
}

