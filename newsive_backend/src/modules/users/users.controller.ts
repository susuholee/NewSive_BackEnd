import { Controller, Get, Post, Body, UseGuards, Req, Query, Put, Delete} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create_users_dto';
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';
import { ChangeNicknameDto } from './dto/change_nickname_dto';
import { ChangePasswordDto } from './dto/change_password_dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Get('availability')
  async checkUsernameAvailability(@Query('username') username: string) {
    return this.usersService.checkUsername(username);
  }

  @Post() 
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@Req () req) {
    return await this.usersService.findMyInfo(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/nickname')
  async changeNickname(@Req() req, @Body() dto: ChangeNicknameDto) {
    return await this.usersService.changeNickname(req.user.id, dto.nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    console.log('req.user:', req.user);
    return this.usersService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteUser(@Req() req) {
    return this.usersService.deleteUser(req.user.id)
  }
}
