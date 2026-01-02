import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';

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
  photos?: string[];

  @IsOptional()
  @IsEnum(['romantic', 'fun', 'emotional', 'adventure'])
  mood?: string;

  @IsOptional()
  @IsArray()
  favorites?: string[];
}
