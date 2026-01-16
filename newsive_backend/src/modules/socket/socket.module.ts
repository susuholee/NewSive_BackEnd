import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtAuthService } from './ws_jwt.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [WsJwtAuthService],
  exports: [WsJwtAuthService],
})
export class SocketModule {}
