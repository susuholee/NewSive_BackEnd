import { Body, Controller, Get, Post, Req, Res, UseGuards} from "@nestjs/common";
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guard/jwt_auth_guard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService, private readonly usersService : UsersService) {}

    @Post('login')
    async login(@Body() dto : LoginDto, @Res({ passthrough : true}) res : Response,) {
        const {accessToken, user} = await this.authService.login(dto.username, dto.password);
        res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60,
    });
        return {user}
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        console.log("요청 데이터",req.user);
        return this.usersService.findMyInfo(req.user.id);
    }
}
