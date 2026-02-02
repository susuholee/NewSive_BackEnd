import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RoomType } from "@prisma/client";
import { PrismaService } from "src/common/prisma/prisma.service";
import { MediaType } from '@prisma/client';

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
              profileImgUrl: true,
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


  
    async createMessage(roomId: string,senderId: number,content?: string,medias?: { type: MediaType; url: string }[]) {
      const room = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        throw new NotFoundException('존재하지 않은 채팅방입니다');
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
        throw new ForbiddenException('채팅방 멤버만 메시지를 보낼 수 있습니다.');
      }

      const hasContent = content && content.trim().length > 0;
      const hasMedias = medias && medias.length > 0;

      if (!hasContent && !hasMedias) {
        throw new BadRequestException('메시지 또는 미디어가 필요합니다.');
      }


      const message = await this.prisma.message.create({
        data: {
          roomId,
          senderId,
          content: hasContent ? content!.trim() : null,
          medias: hasMedias
            ? {
                create: medias!.map((m) => ({
                  type: m.type,
                  url: m.url,
                })),
              }
            : undefined,
        },
        include: {
          sender: {
            select: {
              id: true,
              nickname: true,
            },
          },
          medias: true,
        },
      });

      return {
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        senderNickname: message.sender.nickname,
        content: message.content,
        medias: message.medias,
        createdAt: message.createdAt,
        editedAt: message.editedAt,
      };
    }


    async getMessages(roomId: string, userId: number, take = 30) {
    const room = await this.prisma.chatRoom.findUnique({
        where: { id: roomId },
    });


    if (!room) {
    throw new NotFoundException('채팅방이 존재하지 않습니다.');
    }


  const isMember = await this.prisma.chatRoomMember.findUnique({
    where: {
        roomId_userId: { roomId, userId },
    },
  });
  
  if (!isMember) {
    throw new ForbiddenException('채팅방 멤버가 아닙니다.');
  }

  const messages = await this.prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      sender: {
        select: { nickname: true },
      },
      medias: true,
    },
  });

  return messages.reverse().map((message) => ({
    id: message.id,
    content: message.isDeleted ? '삭제된 메시지입니다' : message.content,
    isDeleted: message.isDeleted,
    createdAt: message.createdAt,
    medias: message.medias ?? [],  
    senderId: message.senderId,
    senderNickname: message.sender.nickname,
    }));
    }

    async updateMessage(messageId:string, userId: number, newContent: string) {
      const message = await this.prisma.message.findUnique({
        where : {id: messageId}
      });

 
      if(!message) {
        throw new NotFoundException('메시지를 찾을 수 없습니다');
      }

      if(message.isDeleted) {
        throw new BadRequestException('삭제된 메시지는 수정할 수 없습니다');
      }
      
      if(message.senderId !== userId) {
        throw new ForbiddenException('본인 메시지만 수정할 수 있습니다');
      }

      const updatedMessage = await this.prisma.message.update({
        where : {id: messageId},
        data: {
          content : newContent,
          editedAt : new Date(),
        }
      });

      return updatedMessage;
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
            data: { isDeleted: true, content: null},
        });
        
        return deletedMessage;
    }

    async deleteMessageMedia(mediaId: string,userId: number) {
      const media = await this.prisma.messageMedia.findUnique({
        where: { id: mediaId },
        include: {
          message: {
            select: {
              id: true,
              roomId: true,
              senderId: true,
            },
          },
        },
      });

      if (!media) {
        throw new NotFoundException('미디어를 찾을 수 없습니다.');
      }

      if (media.message.senderId !== userId) {
        throw new ForbiddenException('본인 메시지의 미디어만 삭제할 수 있습니다.');
      }

  

      await this.prisma.messageMedia.delete({
        where: { id: mediaId },
      });

      return {
        roomId: media.message.roomId,
        messageId: media.messageId,
        mediaId,
      };
    }

    
}