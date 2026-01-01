import { Module } from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { NotificationController } from "./notifications.controller";
import { PrismaModule } from "src/common/prisma/prisma.module";

@Module({
    imports : [PrismaModule],
    providers : [NotificationService],
    controllers : [NotificationController],
    exports : [NotificationService]
})

export class NotificationModule {}