import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { Album, AlbumSchema } from '../../schemas/album.schema';
import {
  GalleryPhoto,
  GalleryPhotoSchema,
} from '../../schemas/gallery-photo.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Couple, CoupleSchema } from '../../schemas/couple.schema';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Album.name, schema: AlbumSchema },
      { name: GalleryPhoto.name, schema: GalleryPhotoSchema },
      { name: User.name, schema: UserSchema },
      { name: Couple.name, schema: CoupleSchema },
    ]),
    UploadModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
