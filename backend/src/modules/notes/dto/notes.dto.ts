import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsNumber,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(['pink', 'yellow', 'blue', 'green', 'purple', 'orange'])
  color: string;

  @IsOptional()
  @IsObject()
  position?: {
    x: number;
    y: number;
  };
}

export class UpdateNotePositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}
