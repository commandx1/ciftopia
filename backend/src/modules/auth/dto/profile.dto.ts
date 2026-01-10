import { IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRelationshipProfileDto {
  @IsString()
  @IsNotEmpty()
  conflictStyle: string;

  @IsString()
  @IsNotEmpty()
  conflictResponse: string;

  @IsString()
  @IsNotEmpty()
  emotionalTrigger: string;

  @IsString()
  @IsNotEmpty()
  decisionStyle: string;

  @IsString()
  @IsNotEmpty()
  loveLanguage: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  coreNeed: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  sensitivityArea: string[];
}
