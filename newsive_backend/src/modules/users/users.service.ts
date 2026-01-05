import { BadRequestException,ConflictException,Injectable} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create_users_dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        nickname: true,
        createdAt: true,
      },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        nickname: true,
        createdAt: true,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async checkUsername(username: string) {
  const user = await this.prisma.user.findUnique({
    where: { username },
  });

  if (user) {
    throw new ConflictException('이미 사용 중인 아이디입니다');
  }

  return { available: true };
}

  async findMyInfo(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        setting: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      allowNotification: user.setting?.allowNotification ?? true,
    };
  }

  async create(dto: CreateUserDto) {
    const { username,password,passwordConfirm,nickname,birthday,gender} = dto;


    if (password !== passwordConfirm) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다');
    }

 
    const existUsername = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existUsername) {
      throw new ConflictException('이미 존재하는 아이디입니다');
    }

   
    const existNickname = await this.prisma.user.findUnique({
      where: { nickname },
    });

    if (existNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다');
    }

  
    const hashedPwd = await bcrypt.hash(password, 10);

 
    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          password: hashedPwd,
          nickname,
          birthday: new Date(birthday),
          gender,
        },
      });

      await tx.userSetting.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      createdAt: user.createdAt,
    };
  }
}
