import { Module } from "@nestjs/common";
import { FriendRequestsService } from "./friends.request.service";
import { FriendRequestsController } from "./friends.request.controller";
@Module({
    controllers : [FriendRequestsController],
    providers : [FriendRequestsService],
    exports : [FriendRequestsService],
})

export class FriendRequestModule {}
