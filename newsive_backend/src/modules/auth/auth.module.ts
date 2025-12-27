import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { UsersModule } from "../users/users.module";
import { AuthController} from "./auth.controller";
import { AuthService} from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
    imports : [
        UsersModule,
        JwtModule.register({
            secret : process.env.JWT_SECRET,
            signOptions : { expiresIn : '1d'}
        })
    ],
    providers : [AuthService, JwtStrategy],
    controllers : [AuthController],
})

export class AuthModule {}