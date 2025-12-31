import { Injectable, BadRequestException} from "@nestjs/common";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class FriendRequestsService {
    constructor(private readonly prisma : PrismaService) {}

    async sendFriendRequest(userId: number, friendUserId: number) {
    // 본인에게 요청 방지
    if (userId === friendUserId) {
        throw new BadRequestException('자기 자신에게는 친구요청을 보낼 수 없습니다');
    }

  // 이미 친구인지 확인
  const alreadyFriend = await this.prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendUserId },
        { userId: friendUserId, friendUserId: userId },
      ],
    },
  });

  if (alreadyFriend) {
    throw new BadRequestException('이미 친구입니다');
  }

  // 기존 요청 존재 여부 확인
  const alreadyRequest = await this.prisma.friendRequest.findFirst({
    where: {
      OR: [
        { userId, friendUserId },
        { userId: friendUserId, friendUserId: userId },
      ],
    },
  });

    if (alreadyRequest) {
     switch (alreadyRequest.status) {
    case 'PENDING':
      throw new BadRequestException('이미 친구 요청이 존재합니다');

    case 'REJECTED':
      throw new BadRequestException('이미 거절된 요청입니다');

    case 'ACCEPTED':
      throw new BadRequestException('이미 친구입니다');

    default:
      break;
    }
  }

  return this.prisma.friendRequest.create({
    data: {
      userId,
      friendUserId,
    },
  });
}


    async getReceivedRequests(userId: number) {
    return this.prisma.friendRequest.findMany({
      where: {
        friendUserId: userId,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    }
    async getSendRequests(userId: number) {
    return this.prisma.friendRequest.findMany({
        where: {
        userId,
        status: 'PENDING',
        },
        include: {
        friendUser: true, 
        },
        orderBy: {
        createdAt: 'desc',
        },
    });
    }

    async acceptFriendRequest(requestId: number, userId: number) {
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

  if (request.status !== 'PENDING') {
    throw new BadRequestException('이미 처리된 요청입니다');
  }

  return this.prisma.$transaction(async (tx) => {
    // 친구 관계 양방향 생성
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

    // 요청 상태 변경
    return tx.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });
  });
    }

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
}
