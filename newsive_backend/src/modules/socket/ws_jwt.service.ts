import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  authenticate(client: Socket) {
    const cookie = client.handshake.headers.cookie;
    if (!cookie) {
      console.log(' NO COOKIE');
      return null;
    }

    const match = cookie.match(/accessToken=([^;]+)/);
    console.log('TOKEN MATCH:', match?.[1]);

    if (!match) {
      console.log('NO TOKEN MATCH');
      return null;
    }

    try {
      const payload = this.jwtService.verify(match[1]);
      console.log('JWT PAYLOAD:', payload);

      return {
        userId: payload.sub,
        username: payload.username,
      };
    } catch (err) {
      console.log('JWT VERIFY ERROR:', err.message);
      return null;
    }
  }

}
