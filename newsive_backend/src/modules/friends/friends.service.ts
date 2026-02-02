import { Injectable, BadRequestException , NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { mapUser } from 'src/common/utils/user.mapper';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}


  async getFriends(userId: number) {
  const friends = await this.prisma.friend.findMany({
    where: { userId },
    select: {
      id: true,
      friendUserId: true,
      createdAt: true,
      friend: {
        select: {
          id: true,
          username: true,
          nickname: true,
          profileImgUrl: true,
        },
      },
    },
  });

return friends.map((f) => {
  const mappedFriend = mapUser(f.friend);
  return {
    id: f.id,
    createdAt: f.createdAt,
    friendId: mappedFriend.id,
    nickname: mappedFriend.nickname,
    username: mappedFriend.username,
    profileImgUrl: mappedFriend.profileImgUrl,
  };
});
  }







  async addFriend(userId: number, friendUserId: number) {

    if (!userId || !friendUserId) {
    throw new BadRequestException('잘못된 사용자 정보입니다.');
    }


 
    if (userId === friendUserId) {
      throw new BadRequestException('자기 자신을 친구로 추가할 수 없습니다.');
    }


    const targetUser = await this.prisma.user.findUnique({
      where: { id: friendUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

  
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
