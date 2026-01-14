import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsMongoId,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PhotoMetadataDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  width?: number;

  @IsOptional()
  height?: number;

  @IsOptional()
  size?: number;
}

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PhotoMetadataDto)
  coverPhoto?: PhotoMetadataDto;
}

export class UploadPhotosDto {
  @IsMongoId()
  @IsOptional()
  albumId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoMetadataDto)
  photos: PhotoMetadataDto[];

  @IsString()
  @IsOptional()
  caption?: string;
}

export class UpdateAlbumDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PhotoMetadataDto)
  coverPhoto?: PhotoMetadataDto;
}
