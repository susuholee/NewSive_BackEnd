import { Controller, Get, Param, ParseIntPipe, Patch, Req, UseGuards} from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService : NotificationService) {}

    @Get()
    async getNotifications(@Req() req) {
        const userId = req.user.id;
        return await this.notificationService.getNotificationByUser(userId);
    }

    @Patch(':id')
    async notificationRead(@Param('id', ParseIntPipe) id : number, @Req() req) {
        const userId = req.user.id;
        return await this.notificationService.notificationRead(id, userId)
    }
}