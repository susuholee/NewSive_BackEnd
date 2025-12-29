import { ConflictException, Injectable } from '@nestjs/common';
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

  async findMyInfo(userId : number) {
    const user = await this.prisma.user.findUnique({
        where : { id : userId },
        include : {
            setting : true
        },
    });

    if (!user) {
        return null;
    }

    return {
        id : user.id,
        username : user.username,
        nickname : user.nickname,
        allowNotify: user.setting?.allowNotify ?? true,
    }    
  }

  async create(dto: CreateUserDto) {
    const { username, password } = dto;

    // 중복 검증 로직 
    const duplicate = await this.prisma.user.findUnique({
      where: { username },
    });

    if (duplicate) {
      throw new ConflictException('이미 존재하는 아이디 입니다');
    }

    const hashedPwd = await bcrypt.hash(password, 10);

  const user = await this.prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        password: hashedPwd,
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
}}