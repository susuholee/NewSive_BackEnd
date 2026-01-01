import { Module } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { PrismaModule } from "src/common/prisma/prisma.module";
import { FriendRequestModule } from "./request/friends.request.module";

@Module({
    imports : [PrismaModule, FriendRequestModule],
    providers : [FriendsService],
    controllers : [FriendsController],
})

export class FriendsModule {}

