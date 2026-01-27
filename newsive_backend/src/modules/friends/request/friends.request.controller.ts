import { Controller,Patch,Post,Body,Param,Req,UseGuards, Get, Query, Delete} from '@nestjs/common';
import { FriendRequestsService } from './friends.request.service';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt_auth_guard';

@Controller('friend_requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestsController {
  constructor(private readonly friendRequestsService: FriendRequestsService) {}

  @Post()
  async createFriendRequest( @Body('friendUserId') friendUserId: number,@User('id') userId: number) {
    return await this.friendRequestsService.createFriendRequest(userId, friendUserId);
  }


  @Get('received')
  async getReceived(@User('id') userId: number) {
    return await this.friendRequestsService.getReceivedRequests(userId);
  }

  @Get('sent')
  async getSent(@User('id') userId: number) {
    return await this.friendRequestsService.getSentRequests(userId);
  }

  @Patch(':id/accept')
  async acceptFriendRequest(@Param('id') id: string,@User('id') userId: number) {
    return await this.friendRequestsService.acceptFriendRequest(Number(id), userId);
  }

  @Patch(':id/reject')
  async rejectFriendRequest(@Param('id') id: string,@User('id') userId: number) {
    return await this.friendRequestsService.rejectFriendRequest(Number(id), userId);
  }

  @Get('search')
  async searchUsers(@User('id') userId: number,@Query('nickname') nickname: string) {
    return await this.friendRequestsService.searchUsersWithRelation(userId, nickname);
  }

  @Delete(':id/cancel')
  async cancelFriendRequest(@Param('id') id: string,@User('id') userId: number) {
    return await this.friendRequestsService.cancelFriendRequest(Number(id), userId);
  }

}
