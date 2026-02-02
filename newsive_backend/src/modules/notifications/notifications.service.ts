import { Injectable, NotFoundException} from "@nestjs/common";
import { PrismaService } from "src/common/prisma/prisma.service";
import { NotificationType } from "@prisma/client";


@Injectable()
export class NotificationService {
    constructor(private readonly prisma : PrismaService) {}

    
    async createNotification(params: {userId: number; type: NotificationType; message: string; link?: string;}) {
    return this.prisma.notification.create({
        data: params,
    });
    }

   
    async getNotificationByUser(userId : number){
        return this.prisma.notification.findMany({
            where : {userId},
            orderBy : {createdAt : 'desc'}
        });
    }


    async notificationRead(notificationId : number , userId : number ) {
        const notification = await this.prisma.notification.findFirst({
            where : {
                id : notificationId,
                userId
            },
        });

      
        if(!notification) {
            throw new NotFoundException("알림을 찾을 수 없습니다.")
        }

        return this.prisma.notification.update({
            where : { id : notificationId},
            data : {isRead : true}
        })
    }

 
    async readAll(userId : number) {
        return this.prisma.notification.updateMany({
            where : { userId, isRead : false},
            data : { isRead : true}
        })
    }

  
    async getUnreadCount(userId : number) {
        return this.prisma.notification.count({
            where : { userId, isRead : false}
        })
    }

    async deleteReadNotifications(userId: number) {
    return this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });
    }
}
