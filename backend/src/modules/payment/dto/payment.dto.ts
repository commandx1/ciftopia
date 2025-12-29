import { IsNotEmpty, IsString, IsNumber, Length } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  cardHolderName: string;

  @IsString()
  @IsNotEmpty()
  cardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  expireMonth: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  expireYear: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 4)
  cvc: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  subdomain: string;
}
