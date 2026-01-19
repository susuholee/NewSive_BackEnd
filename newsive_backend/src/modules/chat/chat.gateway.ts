import {WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect} from "@nestjs/websockets"
import {Server, Socket} from "socket.io";
import { ChatService } from "./chat.service";
import { WsJwtAuthService } from "../socket/ws_jwt.service";
import { JoinRoomDto } from "./dto/join_room.dto";
import { CreateMessageDto } from "./dto/create_message.dto";
import { DeleteMessageDto } from "./dto/delete_message.dto";
import { UpdateMessageDto } from "./dto/update_message.dto";

@WebSocketGateway({
    namespace : '/chat',
    cors : {
        origin: true,
        credentials : true,
    }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server : Server;
    constructor(private readonly chatService: ChatService,  private readonly wsJwtAuthService: WsJwtAuthService) {}

    handleConnection(client: Socket) {
        console.log('채팅 시스템 연결중....' , client.id);

        const user = this.wsJwtAuthService.authenticate(client);
        
        if (!user) {
            client.emit('chat:error', { message: 'Unauthorized' });
            client.disconnect();
            return;
        }

        client.data.user = user;
    }

    handleDisconnect(client: Socket) {
        console.log("채팅 시스템 연결 종료...", client.id);
    }

    @SubscribeMessage('chat:join')
    async handleJoin(@MessageBody() dto: JoinRoomDto, @ConnectedSocket() client: Socket){
        const user = client.data.user;
        const peerUserId = Number(dto.peerUserId);
        console.log('뭐가 찍히는지', client.data.user);

        console.log('chat:join 들어옴', dto, client.id);
        if(!user?.userId) {
            client.emit('chat:error', {message: "로그인이 필요합니다"});
            return;
        }

        if (Number.isNaN(peerUserId)) {
            client.emit('chat:error', { message: '잘못된 사용자 계정 입니다.' });
            return;
        }

        if(peerUserId === user.userId) {
            client.emit('chat:error', {message : "자기 자신과는 채팅할 수 없습니다"});
            return;
        }

        let room;
        try {
            room = await this.chatService.getOrCreateDirectRoom(user.userId, peerUserId);
        } catch (error) {
            client.emit('chat:error', { message : error.message});
            return;
        }

        client.join(room.id);
        console.log(`[채팅][입장] user=${user.userId}, room=${room.id}`);

        const peerMember = room.members.find((m) => m.userId === peerUserId);
        if (!peerMember) {
            client.emit('chat:error', {message: '상대방 정보를 찾을 수 없습니다.'});
            return;
        }

        client.emit('chat:joined', {roomId: room.id, peerUser: { id: peerMember.user.id, nickname: peerMember.user.nickname}});
    }

    @SubscribeMessage('chat:send')
    async handleSend(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket) {
        const user = client.data.user;

        if (!user?.userId){
            client.emit('chat:error', {message : "로그인이 필요합니다"});
            return;
        }

        if (!dto.roomId) {
            client.emit('chat:error', {message : "잘못된 채팅방입니다."});
            return;
        }

        if (!dto.content || dto.content.trim().length === 0){
            client.emit('chat:error', { message: '메시지를 입력해주세요.' });
            return;
        }

        let message;
        try {
            message = await this.chatService.createMessage(dto.roomId, user.userId, dto.content);
        } catch (error) {
            client.emit('chat:error', { message: error.message});
            return;
        }
        
        this.server.to(dto.roomId).emit('chat:message', message);

        console.log(`[채팅][전송요청] user=${user.userId}, room=${dto.roomId}, content=${dto.content}`);
    }

    @SubscribeMessage('chat:update')
    async handleUpdate(@MessageBody() dto:UpdateMessageDto, @ConnectedSocket() client: Socket) {
        const user = client.data.user;

         if(!user?.userId){
            client.emit('chat:error', {message: '로그인이 필요합니다'});
            return;
        }

        let updatedMessage;
        try {
            updatedMessage = await this.chatService.updateMessage(dto.messageId, user.userId, dto.newContent);
        } catch (error) {
            client.emit('chat:error', {message: error.message});
            return;
        }

        this.server.to(updatedMessage.roomId).emit('chat:updated', {messageId: updatedMessage.id, newContent: updatedMessage.content, editedAt: updatedMessage.editedAt});

        console.log(`[채팅][수정] user=${user.userId}, message=${updatedMessage.id}, content=${updatedMessage.content}`);
    }

    @SubscribeMessage('chat:delete')
    async handleDelete(@MessageBody() dto: DeleteMessageDto, @ConnectedSocket() client: Socket){
        const user = client.data.user;

        if(!user?.userId){
            client.emit('chat:error', {message: '로그인이 필요합니다'});
            return;
        }

        let deletedMessage;
        try {
            deletedMessage = await this.chatService.deleteMessage(dto.messageId, user.userId);
        } catch (error) {
            client.emit('chat:error', {message: error.message});
            return;
        }

        this.server.to(deletedMessage.roomId).emit('chat:deleted', {messageId: deletedMessage.id});

        console.log(`[채팅][삭제] user=${user.userId}, message=${deletedMessage.id}`);
    }

}
