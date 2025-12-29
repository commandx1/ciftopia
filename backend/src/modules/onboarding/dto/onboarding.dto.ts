import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateCoupleDto {
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @IsString()
  @IsNotEmpty()
  partnerFirstName: string;

  @IsString()
  @IsNotEmpty()
  partnerLastName: string;

  @IsString()
  @IsNotEmpty()
  partnerEmail: string;

  @IsString()
  @IsNotEmpty()
  partnerPassword: string;

  @IsOptional()
  @IsDateString()
  relationshipStartDate?: string;

  @IsEnum(['dating', 'engaged', 'married'])
  relationshipStatus: string;

  @IsString()
  @IsOptional()
  paymentTransactionId?: string;
}

export class CheckSubdomainDto {
  @IsString()
  @IsNotEmpty()
  subdomain: string;
}

