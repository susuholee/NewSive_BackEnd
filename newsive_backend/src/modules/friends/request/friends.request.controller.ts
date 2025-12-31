import { Controller,Patch,Param,Req,UseGuards} from '@nestjs/common';
import { FriendRequestsService } from './friends.request.service';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt_auth_guard';

@Controller('friend_requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestsController {
  constructor(
    private readonly friendRequestsService: FriendRequestsService,
  ) {}

@Patch(':id/accept')
    acceptFriendRequest(@Param('id') id: string, @User() user) {
        return this.friendRequestsService.acceptFriendRequest( Number(id), user.id);
    }
@Patch(':id/reject')
    rejectFriendRequest(@Param('id') id: string, @User() user) {
        return this.friendRequestsService.rejectFriendRequest( Number(id), user.id);
    }
}
