import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
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

export class CreateBucketListItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['travel', 'food', 'experience', 'home', 'relationship'])
  category: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;
}

export class UpdateBucketListItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(['travel', 'food', 'experience', 'home', 'relationship'])
  category?: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  isCompleted?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoMetadataDto)
  photos?: PhotoMetadataDto[];
}
