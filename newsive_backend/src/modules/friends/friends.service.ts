import { Injectable, BadRequestException , NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}


  async getFriends(userId: number) {
    return this.prisma.friend.findMany({
      where: {
        userId,
        NOT : {
          friendUserId: userId,
        }
      },
      select: {
        id: true,
        friendUserId: true,
        createdAt: true,
        friend: {
          select: {
            id: true,
            username: true,
            nickname: true,
          },
        },
      },
    });
  }




  // 친구 추가 로직
  async addFriend(userId: number, friendUserId: number) {

    if (!userId || !friendUserId) {
    throw new BadRequestException('잘못된 사용자 정보입니다.');
    }


    // 본인 추가 방지
    if (userId === friendUserId) {
      throw new BadRequestException('자기 자신을 친구로 추가할 수 없습니다.');
    }

    // 상대 유저 존재 여부 확인
    const targetUser = await this.prisma.user.findUnique({
      where: { id: friendUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    // 이미 추가된 유저인지 확인
    const AleadyUser = await this.prisma.friend.findUnique({
      where: {
        userId_friendUserId: {
          userId,
          friendUserId,
        },
      },
    });

    if (AleadyUser) {
      throw new BadRequestException('이미 추가된 유저입니다.');
    }

    // 트랜잭션 처리 (친구 추가 <--> 친구 관리)
    await this.prisma.$transaction([
      this.prisma.friend.create({
        data: {
          userId,
          friendUserId,
        },
      }),
      this.prisma.friend.create({
        data: {
          userId: friendUserId,
          friendUserId: userId,
        },
      }),
    ]);

    return { message: '친구 추가 완료' };
  }


  // 친구 삭제
  async removeFriend(userId: number, friendUserId: number) {
    await this.prisma.friend.deleteMany({
      where: {
        OR: [
          { userId, friendUserId },
          { userId: friendUserId, friendUserId: userId },
        ],
      },
    });

    await this.prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { userId, friendUserId },
          { userId: friendUserId, friendUserId: userId },
        ],
        status: 'ACCEPTED',
      },
    });

    return { message: '친구 삭제 완료' };
  }


  




}
