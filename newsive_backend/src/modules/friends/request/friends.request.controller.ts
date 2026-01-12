import { Controller,Patch,Post,Body,Param,Req,UseGuards, Get} from '@nestjs/common';
import { FriendRequestsService } from './friends.request.service';
import { User } from 'src/modules/auth/decorators/user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt_auth_guard';

@Controller('friend_requests')
@UseGuards(JwtAuthGuard)
export class FriendRequestsController {
  constructor(private readonly friendRequestsService: FriendRequestsService) {}

  @Post()
  async create(
    @Body('receiverId') receiverId: number,
    @User('userId') userId: number,
  ) {
    return await this.friendRequestsService.createFriendRequest(userId, receiverId);
  }

  @Post('nickname')
  async createByNickname(
    @Body('nickname') nickname: string,
    @User('userId') userId: number,
  ) {
    return await this.friendRequestsService.createFriendRequestByNickname(userId, nickname);
  }

  @Get('received')
  async getReceived(@User('userId') userId: number) {
    console.log("받은 요청 정보", userId)
    return await this.friendRequestsService.getReceivedRequests(userId);
  }

  @Get('sent')
  async getSent(@User('userId') userId: number) {
    return await this.friendRequestsService.getSentRequests(userId);
  }

  @Patch(':id/accept')
  async acceptFriendRequest(
    @Param('id') id: string,
    @User('userId') userId: number,
  ) {
    return await this.friendRequestsService.acceptFriendRequest(Number(id), userId);
  }

  @Patch(':id/reject')
  async rejectFriendRequest(
    @Param('id') id: string,
    @User('userId') userId: number,
  ) {
    return await this.friendRequestsService.rejectFriendRequest(Number(id), userId);
  }
}
