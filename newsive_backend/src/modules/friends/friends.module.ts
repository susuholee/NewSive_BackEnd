import { Module } from "@nestjs/common";
import { FriendsService } from "./friends.service";
import { FriendsController } from "./friends.controller";
import { PrismaModule } from "src/common/prisma/prisma.module";

@Module({
    imports : [PrismaModule],
    providers : [FriendsService],
    controllers : [FriendsController],
})

export class FriendsModule {}

