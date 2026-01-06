import { Body, Controller, Get, Post, Req, Res, UseGuards} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService) {}

    @Post('login')
    async login(@Body() dto : LoginDto, @Res({ passthrough : true}) res : Response,) {
        const {accessToken, user} = await this.authService.login(dto.username, dto.password);
        res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60,
    });
        return {user}
    }
    
    @Post('logout')
    async logout(@Res({passthrough : true}) res : Response) {
        res.clearCookie('accessToken', {
            httpOnly : true,
            sameSite : 'lax',
            secure : false,
        });

        return {message : "로그아웃 성공"}
    }

}
