import * as bcrypt from "bcrypt";
import { UnauthorizedException, Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(private readonly userService : UsersService, private readonly jwtService : JwtService ) {}

    async verifyUser(username : string, password : string) {
        const user = await this.userService.findByUsername(username);

        if (!user) {
            throw new UnauthorizedException("존재하지 않은 유저입니다");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new UnauthorizedException("비밀번호가 일치하지 않습니다");
        }

        return user;
    }
    async login(user : any) {
        const payload = {
            sub : user.id,
            username : user.username,
        };
        
        return { accessToken  : this.jwtService.sign(payload)};
    }
}