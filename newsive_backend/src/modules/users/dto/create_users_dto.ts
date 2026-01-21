import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional,IsDateString} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;


  @IsString()
  @MinLength(8)
  passwordConfirm: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';
}
