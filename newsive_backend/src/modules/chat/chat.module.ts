import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { PrismaService } from "src/common/prisma/prisma.service";
import { SocketModule } from "../socket/socket.module";

@Module({
    imports: [SocketModule],
    providers : [ChatService, ChatGateway, PrismaService],
    controllers : [ChatController],
    exports : [ChatService],
})

export class ChatModule {}
