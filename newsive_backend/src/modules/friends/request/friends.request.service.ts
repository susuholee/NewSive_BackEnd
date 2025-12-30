import { Injectable, BadRequestException} from "@nestjs/common";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class FriendRequestsService {
    constructor(private readonly prisma : PrismaService) {}

    async sendFriendRequest(userId : number, friendUserId : number){
        // 본인에게 요청 방지
        if(userId === friendUserId) {
            throw new BadRequestException('자기 자신에게는 친구요청을 보낼 수 없습니다');
        }

       // 이미 친구 관계인지 확인
        const alreadyFriend = await this.prisma.friend.findFirst({
            where : {
                OR : [
                    { userId, friendUserId },
                    { userId: friendUserId, friendUserId : userId}
                ],
            },
        });

        // 친구 검증
        if (alreadyFriend) {
            throw new BadRequestException('이미 친구입니다')
        }

        // 이미 요청 보냈는지 확인
        const alreadyRequest  = await this.prisma.friendRequest.findUnique({
            where : {
                userId_friendUserId : { userId, friendUserId }
            },
        });

        if (alreadyRequest ) {
            throw new BadRequestException('이미 요청을 보냈습니다');
        }

        return this.prisma.friendRequest.create({
            data : { userId , friendUserId}
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

}