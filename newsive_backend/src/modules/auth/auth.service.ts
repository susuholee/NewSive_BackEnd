import * as bcrypt from 'bcrypt';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다',
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }


  
}
