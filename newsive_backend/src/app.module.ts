import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notifications/notifications.module';
import { FriendsModule } from './modules/friends/friends.module';
import { ChatModule } from './modules/chat/chat.module';
import { SocketModule } from './modules/socket/socket.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    NotificationModule,
    FriendsModule,
    ChatModule,
    SocketModule,
  ],
})
export class AppModule {}
