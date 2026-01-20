import { IsString, IsEmail, IsNumber, IsArray, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  subdomain: string;

  @IsEmail()
  email: string;

  @IsString()
  partner1: string;

  @IsString()
  partner2: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsString()
  liked_features: string;

  @IsString()
  improvements: string;

  @IsOptional()
  @IsString()
  bugs?: string;

  @IsOptional()
  @IsString()
  feature_requests?: string;

  @IsString()
  device: string;

  @IsString()
  frequency: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  ease_of_use: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  design: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  performance: number;

  @IsString()
  recommend: string;

  @IsString()
  would_pay: string;

  @IsOptional()
  @IsString()
  price_range?: string;

  @IsOptional()
  @IsString()
  additional_comments?: string;

  @IsBoolean()
  consent: boolean;
}
