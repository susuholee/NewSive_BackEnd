import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RoomType } from "@prisma/client";
import { PrismaService } from "src/common/prisma/prisma.service";


@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) {}

    async getOrCreateDirectRoom(userId: number, peerUserId: number) {
  const peerUser = await this.prisma.user.findUnique({
    where: { id: peerUserId },
  });

  if (!peerUser) {
    throw new NotFoundException("존재하지 않은 유저입니다");
  }

  const isFriend = await this.prisma.friend.findFirst({
    where: {
      OR: [
        { userId, friendUserId: peerUserId },
        { userId: peerUserId, friendUserId: userId },
      ],
    },
  });

  if (!isFriend) {
    throw new ForbiddenException("친구인 유저만 채팅할 수 있습니다.");
  }

  const existingRoom = await this.prisma.chatRoom.findFirst({
    where: {
      type: RoomType.DIRECT,
      members: {
        every: { userId: { in: [userId, peerUserId] } },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  if (existingRoom) {
    return existingRoom;
  }

  const room = await this.prisma.chatRoom.create({
    data: {
      type: RoomType.DIRECT,
      members: {
        create: [{ userId }, { userId: peerUserId }],
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  return room;
    }


    async createMessage(roomId: string, senderId: number, content: string) {
  const room = await this.prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new NotFoundException("존재하지 않은 채팅방입니다");
  }

  const isMember = await this.prisma.chatRoomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId: senderId,
      },
    },
  });

  if (!isMember) {
    throw new ForbiddenException("채팅방 멤버만 메시지를 보낼 수 있습니다.");
  }

  const message = await this.prisma.message.create({
    data: {
      roomId,
      senderId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });

  return {
    id: message.id,
    senderId: message.senderId,
    senderNickname: message.sender.nickname,
    content: message.content,
    createdAt: message.createdAt,
  };
    }


    async getMessages(roomId: string,userId: number,take: number = 30) {
    const isMember = await this.prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId,
        },
      },
    });

    if (!isMember) {
      throw new ForbiddenException('채팅방 멤버가 아닙니다.');
    }

    const messages = await this.prisma.message.findMany({
        where : {roomId},
        orderBy : {createdAt: 'asc'},
        take,
    });
    return messages.map((message) => ({
        ...message,
        content: message.isDeleted ? '삭제된 메시지입니다' : message.content, 
    }));

    }

    async deleteMessage(messageId: string, userId: number) {
        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
        });
        if (!message) {
            throw new NotFoundException('메시지를 찾을 수 없습니다.');
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('본인이 보낸 메시지만 삭제할 수 있습니다.');
        }

        if (message.isDeleted) {
            throw new ForbiddenException('이미 삭제된 메시지입니다.');
        }

        const deletedMessage = await this.prisma.message.update({
            where: { id: messageId },
            data: { isDeleted: true },
        });
        
        return deletedMessage;
    }

    
}