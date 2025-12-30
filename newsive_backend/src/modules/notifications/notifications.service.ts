import { Injectable, NotFoundException} from "@nestjs/common";
import { PrismaService } from "src/common/prisma/prisma.service";

@Injectable()
export class NotificationService {
    constructor(private readonly prisma : PrismaService) {}

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
}
