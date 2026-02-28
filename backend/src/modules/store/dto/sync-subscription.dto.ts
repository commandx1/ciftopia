import { IsIn, IsOptional, IsString } from 'class-validator';

export class SyncSubscriptionDto {
  @IsIn(['free', 'plus', 'premium'])
  planCode: string;

  @IsOptional()
  @IsString()
  revenueCatAppUserId?: string;
}
