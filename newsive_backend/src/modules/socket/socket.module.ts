import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WsJwtAuthService } from './ws_jwt.service';

@Module({
  imports: [
    AuthModule,
  ],
  providers: [WsJwtAuthService],
  exports: [WsJwtAuthService],
})
export class SocketModule {}
