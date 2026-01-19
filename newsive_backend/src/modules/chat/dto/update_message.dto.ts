import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateMessageDto {
    @IsString()
    @IsNotEmpty()
    messageId: string;


    @Transform(({ value }) => value.trim())
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    newContent: string;
}