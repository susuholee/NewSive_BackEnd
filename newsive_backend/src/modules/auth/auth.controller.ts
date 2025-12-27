import { Body, Controller, Get, Post, Req, UseGuards} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guard/jwt_auth_guard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService : AuthService) {}

    @Post('login')
    async login(@Body() dto : LoginDto) {
        const user = await this.authService.verifyUser(dto.username, dto.password);

        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Req() req) {
        return req.user
    }
}
