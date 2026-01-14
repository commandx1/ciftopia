import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateImportantDateDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsObject()
  @IsOptional()
  photo?: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  };
}

export class UpdateImportantDateDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsObject()
  @IsOptional()
  photo?: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  };
}
