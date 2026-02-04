import { Body, Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { profileImageMulterOptions } from '../../common/upload/profile.multer';
import { CreateUserDto } from "../users/dto/create_users_dto";
import { Multer } from "multer";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService) {}


    @Post('signup')
    @UseInterceptors(FileInterceptor('profileImage', profileImageMulterOptions))
    async signup( @Body() dto: CreateUserDto, @UploadedFile() file?: Multer.File,) {
        return  await this.authService.createUser(dto, file);
    }

    @Post('login')
    async login(@Body() dto : LoginDto, @Res({ passthrough : true}) res : Response,) {
        const {accessToken, user} = await this.authService.login(dto.username, dto.password);
        res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure : true,
        sameSite: "none",
        domain: ".newsive.store",
        maxAge: 1000 * 60 * 60,
    });
        return {user}
    }
    
    @Post('logout')
    async logout(@Res({passthrough : true}) res : Response) {
        res.clearCookie('accessToken', {
            httpOnly : true,
            secure: true,    
            sameSite: "none",    
        });

        return {message : "로그아웃 성공"}
    }

}
