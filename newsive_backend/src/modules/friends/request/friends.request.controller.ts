import { Controller,Patch,Post,Body,Param,Req,UseGuards, Get} from '@nestjs/common';
import { FriendRequestsService } from './friends.request.service';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt_auth_guard';

@Controller('friend_requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestsController {
  constructor( private readonly friendRequestsService: FriendRequestsService) {}

  @Post()
    create(@Body('receiverId') receiverId: number,@User() user) {
      return this.friendRequestsService.createFriendRequest(user.id,receiverId);
    }

  @Get('received')
    getReceived(@User() user) {
      return this.friendRequestsService.getReceivedRequests(user.id);
    }

  @Get('sent')
    getSent(@User() user) {
      return this.friendRequestsService.getSentRequests(user.id);
    }

  @Patch(':id/accept')
    acceptFriendRequest(@Param('id') id: string, @User() user) {
        return this.friendRequestsService.acceptFriendRequest( Number(id), user.id);
    }
  @Patch(':id/reject')
    rejectFriendRequest(@Param('id') id: string, @User() user) {
        return this.friendRequestsService.rejectFriendRequest( Number(id), user.id);
    }
}
