import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateMoodDto {
  @IsNotEmpty()
  @IsString()
  emoji: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;
}

export class MoodResponseDto {
  id: string;
  userId: string;
  coupleId: string;
  emoji: string;
  note?: string;
  date: string;
}
