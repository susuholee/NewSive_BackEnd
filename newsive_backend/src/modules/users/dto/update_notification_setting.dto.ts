import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationSettingDto {
  @IsOptional()
  @IsBoolean()
  allowNotification?: boolean;

  @IsOptional()
  @IsBoolean()
  allowBreakingNews?: boolean;

  @IsOptional()
  @IsBoolean()
  allowKeywordAlert?: boolean;

  @IsOptional()
  @IsString()
  defaultRegion?: string;
}
