import { IsString, IsNotEmpty, IsDateString, IsEnum, IsOptional, IsArray } from 'class-validator'

export class CreateTimeCapsuleDto {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsDateString()
  @IsNotEmpty()
  unlockDate: string

  @IsEnum(['me', 'partner', 'both'])
  @IsOptional()
  receiver?: string

  @IsArray()
  @IsOptional()
  photos?: any[]

  @IsOptional()
  video?: any
}

export class UpdateTimeCapsuleDto {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  content?: string

  @IsDateString()
  @IsOptional()
  unlockDate?: string

  @IsEnum(['me', 'partner', 'both'])
  @IsOptional()
  receiver?: string

  @IsOptional()
  isOpened?: boolean

  @IsOptional()
  video?: any
}

export class AddReflectionDto {
  @IsString()
  @IsNotEmpty()
  content: string
}
