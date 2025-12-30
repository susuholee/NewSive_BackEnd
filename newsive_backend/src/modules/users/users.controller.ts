import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create_users_dto';
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return await this.usersService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    console.log("여기야 DTO",dto); 
    return await this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@Req () req) {
    return await this.usersService.findMyInfo(req.user.userId)
  }
}
