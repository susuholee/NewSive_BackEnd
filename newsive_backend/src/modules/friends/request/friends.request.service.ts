import { Injectable, BadRequestException, NotFoundException, ConflictException} from "@nestjs/common";
import { NotificationType } from "@prisma/client";
import { PrismaService } from "src/common/prisma/prisma.service";
import { mapUser } from "src/common/utils/user.mapper";
import { NotificationService } from "src/modules/notifications/notifications.service";


@Injectable()
export class FriendRequestsService {
  constructor(private readonly prisma : PrismaService, private readonly notificationService : NotificationService) {}


    async createFriendRequest(userId: number, friendUserId: number) {
  if (userId === friendUserId) {
    throw new BadRequestException('자기 자신에게는 친구요청을 보낼 수 없습니다');
  }

  const targetUser = await this.prisma.user.findUnique({
    where: { id: friendUserId },
  });

  if (!targetUser) {
    throw new NotFoundException('존재하지 않는 유저입니다');
  }

  const sender = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { nickname: true },
  });

  const alreadyFriend = await this.prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendUserId },
        { userId: friendUserId, friendUserId: userId },
      ],
    },
  });

  if (alreadyFriend) {
    throw new ConflictException('이미 친구입니다');
  }

  const existingRequest = await this.prisma.friendRequest.findFirst({
    where: {
      OR: [
        { userId, friendUserId },
        { userId: friendUserId, friendUserId: userId },
      ],
    },
  });

  if (existingRequest) {
    if (existingRequest.status === 'ACCEPTED') {
      throw new ConflictException('이미 친구입니다');
    }

    if (existingRequest.status === 'PENDING') {
      if (existingRequest.userId === userId) {
        throw new ConflictException('이미 친구 요청을 보냈습니다');
      } else {
        throw new ConflictException('상대방이 이미 친구 요청을 보냈습니다');
      }
    }

    if (existingRequest.status === 'REJECTED') {
      const revivedRequest = await this.prisma.friendRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'PENDING',
          createdAt: new Date(),
          userId,
          friendUserId,
        },
      });

      await this.notificationService.createNotification({
        userId: friendUserId,
        type: NotificationType.FRIEND_REQUEST,
        message: `${sender?.nickname}님이 다시 친구 요청을 보냈습니다.`,
      });

      return revivedRequest;
    }
  }

  const request = await this.prisma.friendRequest.create({
    data: {
      userId,
      friendUserId,
    },
  });

  await this.notificationService.createNotification({
    userId: friendUserId,
    type: NotificationType.FRIEND_REQUEST,
    message: `${sender?.nickname}님이 친구 요청을 보냈습니다.`,
  });

  return request;
    }



    async getReceivedRequests(userId: number) {
  const requests = await this.prisma.friendRequest.findMany({
    where: {
      friendUserId: userId,
      status: 'PENDING',
    },
    select: {
      id: true,
      createdAt: true,
      user: {   
        select: {
          id: true,
          username: true,
          nickname: true,
          profileImgUrl: true,  
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return requests.map((r) => {
    const mappedUser = mapUser(r.user);

    return {
      id: r.id,
      createdAt: r.createdAt,
      user: mappedUser,   
    };
  });
    }


    // 보낸 요청 조회
    async getSentRequests(userId: number) {
      const requests = await this.prisma.friendRequest.findMany({
        where: {
          userId,
          status: 'PENDING',
          NOT: {
            friendUserId: userId, 
          },
        },
        select: {
          id: true,
          createdAt: true,
          friendUser: {
            select: {
              id: true,
              nickname: true,
              username: true,
              profileImgUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return requests.map((r) => {
        const mappedFriend = mapUser(r.friendUser);

        return {
          id: r.id,
          createdAt: r.createdAt,
          friendUser: mappedFriend, 
        };
      });
    }


    // 수락한 요청
    async acceptFriendRequest(requestId: number, userId: number) {
  const request = await this.prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new BadRequestException('친구 요청이 존재하지 않습니다');
  }

  if (request.friendUserId !== userId) {
    throw new BadRequestException('요청을 처리할 권한이 없습니다');
  }

  if (request.status !== 'PENDING') {
    throw new BadRequestException('이미 처리된 요청입니다');
  }

  if (request.userId === request.friendUserId) {
    throw new BadRequestException('본인은 친구로 추가할 수 없습니다');
  }

  const result = await this.prisma.$transaction(async (tx) => {
    await tx.friend.createMany({
      data: [
        {
          userId: request.userId,
          friendUserId: request.friendUserId,
        },
        {
          userId: request.friendUserId,
          friendUserId: request.userId,
        },
      ],
      skipDuplicates: true,
    });

    return tx.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });
  });

  const accepter = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { nickname: true },
  });

  await this.notificationService.createNotification({
    userId: request.userId,
    type: NotificationType.FRIEND_ACCEPTED,
    message: `${accepter?.nickname}님이 친구 요청을 수락했습니다.`,
  });

  return result;
    }


    // 거절한 요청
    async rejectFriendRequest(requestId: number, userId: number) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('친구 요청이 존재하지 않습니다');
    }

    // 내가 받은 요청인지 확인
    if (request.friendUserId !== userId) {
      throw new BadRequestException('요청을 처리할 권한이 없습니다');
    }

    // 이미 처리된 요청인지 확인
    if (request.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 요청입니다');
    }

    // 상태 변경 -> 요청 실패
    return this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
    }

    async searchUsersWithRelation(userId: number, nickname: string) {
  if (!nickname?.trim()) return [];

  const users = await this.prisma.user.findMany({
    where: {
      nickname: {
        contains: nickname,
        mode: 'insensitive',
      },
      NOT: { id: userId },
    },
    select: {
      id: true,
      nickname: true,
      username: true,
      profileImgUrl: true,
    },
    take: 20,
  });

  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);

  const friends = await this.prisma.friend.findMany({
    where: {
      OR: [
        { userId, friendUserId: { in: userIds } },
        { userId: { in: userIds }, friendUserId: userId },
      ],
    },
    select: {
      userId: true,
      friendUserId: true,
    },
  });


  const requests = await this.prisma.friendRequest.findMany({
    where: {
      OR: [
        { userId, friendUserId: { in: userIds } },        
        { userId: { in: userIds }, friendUserId: userId }, 
      ],
    },
    select: {
      userId: true,
      friendUserId: true,
      status: true,
    },
  });

  return users.map((u) => {
    let relation: 'FRIEND' | 'SENT' | 'RECEIVED' | 'NONE' = 'NONE';


    const isFriend = friends.some((f) =>(f.userId === userId && f.friendUserId === u.id) || (f.userId === u.id && f.friendUserId === userId));

    if (isFriend) {
      relation = 'FRIEND';
    } else {
      const req = requests.find((r) => (r.userId === userId && r.friendUserId === u.id) || (r.userId === u.id && r.friendUserId === userId));

      if (req && req.status === 'PENDING') {
        if (req.userId === userId) {
          relation = 'SENT';      
        } else {
          relation = 'RECEIVED';   
        }
      }
    }

    const mappedUser = mapUser({
    id: u.id,
    nickname: u.nickname,
    username: u.username,
    profileImgUrl: u.profileImgUrl,
  });

    return {
      ...mappedUser,
      relation,
    };
  });
    }

    // 요청 취소
    async cancelFriendRequest(requestId: number, userId: number) {
      const request = await this.prisma.friendRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new NotFoundException('친구 요청이 존재하지 않습니다');
      }


      if (request.userId !== userId) {
        throw new BadRequestException('요청을 취소할 권한이 없습니다');
      }

      
      if (request.status !== 'PENDING') {
        throw new BadRequestException('이미 처리된 요청은 취소할 수 없습니다');
      }
      await this.prisma.friendRequest.delete({
        where: { id: requestId },
      });

      return { message: '친구 요청을 취소했습니다.' };
    }


}
