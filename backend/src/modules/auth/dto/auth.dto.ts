import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsOptional()
  avatar?: {
    url: string;
    width?: number;
    height?: number;
    size?: number;
  };
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  subdomain?: string;
}
