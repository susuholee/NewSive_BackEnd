import {IsString,IsOptional,MaxLength,IsArray} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessageDto {
  @IsString()
  roomId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;

  @IsOptional()
  @IsArray()
  @Type(() => Object)
  medias?: {
    type: 'IMAGE' | 'VIDEO';
    url: string;
  }[];
}
