import { Controller, Get, Post, Body, UseGuards, Req, Query, Put, Delete} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create_users_dto';
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';
import { ChangeNicknameDto } from './dto/change_nickname_dto';
import { ChangePasswordDto } from './dto/change_password_dto';
import { UpdateNotificationSettingDto } from './dto/update_notification_setting.dto';
import { User } from '../auth/decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('availability')
  async checkUsername(@Query('username') username: string) {
    return this.usersService.checkUsername(username);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@User('userId') userId: number) {
    return  await this.usersService.findMyInfo(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/nickname')
  async changeNickname(@User('userId') userId: number,@Body() dto: ChangeNicknameDto,
  ) {
    return await this.usersService.changeNickname(userId, dto.nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  async changePassword(@User('userId') userId: number,@Body() dto: ChangePasswordDto) {
    return  await this.usersService.changePassword(userId,dto.currentPassword,dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteUser(@User('userId') userId: number) {
    return await this.usersService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/settings/notification')
  async getMyNotificationSetting(@User('userId') userId: number) {
    return await this.usersService.getNotificationSetting(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/settings/notification')
  async updateMyNotificationSetting(@User('userId') userId: number,@Body() dto: UpdateNotificationSettingDto) {
    return  await this.usersService.updateNotificationSetting(userId, dto);
  }
}
