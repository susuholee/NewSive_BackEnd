import { Controller, Get, Param, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guard/jwt_auth_guard";
import { ChatService } from "./chat.service";

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

@Get('rooms/:roomId/messages')
    async getMessages(@Param('roomId') roomId: string,@Query('take') take: string,@Req() req) {
        return await this.chatService.getMessages(roomId, req.user.id,take ? Number(take) : 30);
    }


}