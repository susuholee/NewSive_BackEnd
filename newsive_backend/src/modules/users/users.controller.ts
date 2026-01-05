import { Controller, Get, Post, Body, UseGuards, Req, Query} from '@nestjs/common';
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

  @Get('availability')
  async checkUsernameAvailability(@Query('username') username: string) {
    return this.usersService.checkUsername(username);
  }

  @Post() 
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyInfo(@Req () req) {
    return await this.usersService.findMyInfo(req.user.userId)
  }
}
