import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Req, UseGuards} from "@nestjs/common";
import { NotificationService } from "./notifications.service";
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService : NotificationService) {}

  @Get()
  async getNotifications(@Req() req) {
    return await this.notificationService.getNotificationByUser(req.user.id);
  }

  @Get('unread')
  async unreadCount(@Req() req) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
      return { unreadCount: count };
    }

  @Patch('read_all')
  async readAll(@Req() req) {
    return await this.notificationService.readAll(req.user.id);
  }

  @Patch(':id/read')
  async readOne(@Param('id', ParseIntPipe) id: number,@Req() req) {
    return  await this.notificationService.notificationRead(id, req.user.id);
  }

   @Delete('read')
    async deleteReadNotifications(@Req() req) {
    return await this.notificationService.deleteReadNotifications(req.user.id);
  }
}