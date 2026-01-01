import { Injectable, NotFoundException} from "@nestjs/common";
import { PrismaService } from "src/common/prisma/prisma.service";
import { NotificationType } from "@prisma/client";


@Injectable()
export class NotificationService {
    constructor(private readonly prisma : PrismaService) {}

    // 알림 생성
    async createNotification(params: {userId: number; type: NotificationType; message: string; link?: string;}) {
    return this.prisma.notification.create({
        data: params,
    });
    }

    // 알림 목록 조회
    async getNotificationByUser(userId : number){
        return this.prisma.notification.findMany({
            where : {userId},
            orderBy : {createdAt : 'desc'}
        });
    }

    // 알림 읽음 처리
    async notificationRead(notificationId : number , userId : number ) {
        const notification = await this.prisma.notification.findFirst({
            where : {
                id : notificationId,
                userId
            },
        });

        // 알림 존재 여부 확인
        if(!notification) {
            throw new NotFoundException("알림을 찾을 수 없습니다.")
        }

        return this.prisma.notification.update({
            where : { id : notificationId},
            data : {isRead : true}
        })
    }

    // 전체 알림 읽음
    async readAll(userId : number) {
        return this.prisma.notification.updateMany({
            where : { userId, isRead : false},
            data : { isRead : true}
        })
    }

    // 안 읽은 알림 개수
    async getUnreadCount(userId : number) {
        return this.prisma.notification.count({
            where : { userId, isRead : true}
        })
    }
}
