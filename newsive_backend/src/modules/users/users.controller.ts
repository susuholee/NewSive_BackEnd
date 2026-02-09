import { Controller, Get, Post, Body, UseGuards, Req, Query, Put, Delete, Patch, UseInterceptors, UploadedFile} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';
import { ChangeNicknameDto } from './dto/change_nickname_dto';
import { ChangePasswordDto } from './dto/change_password_dto';
import { User } from '../auth/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { profileImageMulterOptions } from 'src/common/upload/profile.multer';
import { Multer } from "multer";


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('availability')
  async checkUsername(@Query('username') username: string) {
    return this.usersService.checkUsername(username);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@User('id') userId: number) {
    return  await this.usersService.findMyInfo(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/nickname')
  async changeNickname(@User('id') userId: number,@Body() dto: ChangeNicknameDto,
  ) {
    return await this.usersService.changeNickname(userId, dto.nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  async changePassword(@User('id') userId: number,@Body() dto: ChangePasswordDto) {
    return  await this.usersService.changePassword(userId,dto.currentPassword,dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteUser(@User('id') userId: number) {
    return await this.usersService.deleteUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile/image')
  @UseInterceptors(FileInterceptor('file', profileImageMulterOptions))
  async updateProfileImage(@User('id') userId: number,@UploadedFile() file: Multer.File) {
   const imagePath = file ? `uploads/profile/${file.filename}` : null;

  return  await this.usersService.updateProfileImage(userId, imagePath);
}


}

