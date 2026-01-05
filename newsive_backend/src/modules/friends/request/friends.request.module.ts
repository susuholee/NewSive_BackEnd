import { Module } from "@nestjs/common";
import { FriendRequestsService } from "./friends.request.service";
import { FriendRequestsController } from "./friends.request.controller";
import { NotificationModule } from "src/modules/notifications/notifications.module";
@Module({
    imports : [NotificationModule],
    controllers : [FriendRequestsController],
    providers : [FriendRequestsService],
    exports : [FriendRequestsService],
})

export class FriendRequestModule {}
