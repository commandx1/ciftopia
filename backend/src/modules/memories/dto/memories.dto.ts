import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

export class PhotoMetadata {
  @IsString()
  url: string;

  @IsOptional()
  width?: number;

  @IsOptional()
  height?: number;

  @IsOptional()
  size?: number;
}

export class CreateMemoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsArray()
  photos?: PhotoMetadata[];

  @IsOptional()
  @IsEnum(['romantic', 'fun', 'emotional', 'adventure'])
  mood?: string;

  @IsOptional()
  @IsArray()
  favorites?: string[];
}
