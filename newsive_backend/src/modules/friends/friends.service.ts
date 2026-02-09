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
