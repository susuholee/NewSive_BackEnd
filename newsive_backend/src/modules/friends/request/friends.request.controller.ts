import { Controller,Patch,Post,Body,Param,Req,UseGuards, Get} from '@nestjs/common';
import { FriendRequestsService } from './friends.request.service';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt_auth_guard';

@Controller('friend_requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestsController {
  constructor( private readonly friendRequestsService: FriendRequestsService) {}

  @Post()
    async create(@Body('receiverId') receiverId: number,@User() user) {
      return await this.friendRequestsService.createFriendRequest(user.id,receiverId);
    }

  @Post('nickname')
  async createByNickname(@Body('nickname') nickname: string, @User() user) {
    return  await this.friendRequestsService.createFriendRequestByNickname(user.id, nickname);
  }

  @Get('received')
   async  getReceived(@User() user) {
      return  await this.friendRequestsService.getReceivedRequests(user.id);
    }

  @Get('sent')
   async getSent(@User() user) {
      return await this.friendRequestsService.getSentRequests(user.id);
    }

  @Patch(':id/accept')
    async acceptFriendRequest(@Param('id') id: string, @User() user) {
        return await this.friendRequestsService.acceptFriendRequest( Number(id), user.id);
    }
  @Patch(':id/reject')
   async rejectFriendRequest(@Param('id') id: string, @User() user) {
        return  await this.friendRequestsService.rejectFriendRequest( Number(id), user.id);
    }

    
}
