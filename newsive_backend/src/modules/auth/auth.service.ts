import * as bcrypt from 'bcrypt';
import { UnauthorizedException, Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create_users_dto';
import { Multer} from "multer";
import { PrismaService } from 'src/common/prisma/prisma.service';
import { mapUser } from 'src/common/utils/user.mapper';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService, private readonly prisma: PrismaService,  
  ) {}


  async createUser(dto: CreateUserDto, file?: Multer.File) {
  const username = dto.username?.trim();
  const nickname = dto.nickname?.trim();
  const password = dto.password;
  const passwordConfirm = dto.passwordConfirm;
  const birthday = dto.birthday;
  const gender = dto.gender;



  if (!username) {
    throw new BadRequestException('아이디를 입력해주세요');
  }

  if (!nickname) {
    throw new BadRequestException('닉네임을 입력해주세요');
  }



  const USERNAME_RULE = /^[a-zA-Z0-9]+$/;
  const NICKNAME_RULE = /^[가-힣a-zA-Z0-9]{2,10}$/;

  if (!USERNAME_RULE.test(username)) {
    throw new BadRequestException('아이디는 영문과 숫자만 사용할 수 있습니다');
  }

  if (!NICKNAME_RULE.test(nickname)) {
    throw new BadRequestException(
      '닉네임은 2~10자, 한글/영문/숫자만 사용할 수 있습니다',
    );
  }

  if (username.toLowerCase() === nickname.toLowerCase()) {
    throw new BadRequestException('아이디와 닉네임은 같을 수 없습니다');
  }


  if (password !== passwordConfirm) {
    throw new BadRequestException('비밀번호가 일치하지 않습니다');
  }

  if (password.length < 8) {
    throw new BadRequestException('비밀번호는 8자 이상이어야 합니다');
  }


  const existUsername = await this.prisma.user.findUnique({
    where: { username },
  });

  if (existUsername) {
    throw new ConflictException('이미 존재하는 아이디입니다');
  }

  const hashedPwd = await bcrypt.hash(password, 10);

  const userData: any = {
    username,
    password: hashedPwd,
    nickname,
  };

  if (birthday) {
    userData.birthday = new Date(birthday);
  }

  if (gender) {
    userData.gender = gender;
  }

  if (file) {
    const imageUrl = `http://localhost:4000/uploads/profile/${file.filename}`;
    userData.profileImgUrl = imageUrl;
  }

  const user = await this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });

    await tx.userSetting.create({
      data: {
        userId: user.id,
      },
    });

    return user;
  });

  const mappedUser = mapUser(user);

  return {
    id: mappedUser.id,
    username: mappedUser.username,
    nickname: mappedUser.nickname,
    birthday: mappedUser.birthday,
    gender: mappedUser.gender,
    profileImgUrl: mappedUser.profileImgUrl,
    createdAt: mappedUser.createdAt,
  };
  }



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
