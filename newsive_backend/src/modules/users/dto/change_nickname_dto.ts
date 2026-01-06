import { IsString, IsNotEmpty, Length } from "class-validator";

export class ChangeNicknameDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    nickname: string;
}