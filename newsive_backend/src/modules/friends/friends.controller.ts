import { Controller, Get, Post, Delete, Body, Req, UseGuards} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/guard/jwt_auth_guard';

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}


  @Get()
  async getFriends(@Req() req) {
    const userId = req.user.id;
    return await this.friendsService.getFriends(userId);
  }


  @Post()
  async addFriend(@Req() req, @Body('friendUserId') friendUserId: number) {
    const userId =  req.user.id;
    return await this.friendsService.addFriend(userId, friendUserId);
  }


  @Delete()
  async removeFriend(@Req() req, @Body('friendUserId') friendUserId: number) {
    const userId =  req.user.id;
    return await this.friendsService.removeFriend(userId, friendUserId);
  }



}
