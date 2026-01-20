import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notifications/notifications.module';
import { FriendsModule } from './modules/friends/friends.module';
import { ChatModule } from './modules/chat/chat.module';
import { SocketModule } from './modules/socket/socket.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { NewsModule } from './modules/news/news.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal : true,
    }),
    CacheModule.register({
      isGlobal : true,
      ttl : 600,
    }),


    PrismaModule,
    UsersModule,
    AuthModule,
    NotificationModule,
    FriendsModule,
    ChatModule,
    SocketModule,
    NewsModule
  ],
})
export class AppModule {}
