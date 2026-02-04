import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  authenticate(client: Socket) {
    const cookie = client.handshake.headers.cookie;
     console.log("SOCKET COOKIE:", cookie);
    if (!cookie) {
      return null;
    }

    const match = cookie.match(/accessToken=([^;]+)/);

    if (!match) {
      return null;
    }

    try {
      const payload = this.jwtService.verify(match[1]);

      return {
        userId: payload.sub,
        username: payload.username,
      };
    } catch (err) {
      return null;
    }
  }

}
