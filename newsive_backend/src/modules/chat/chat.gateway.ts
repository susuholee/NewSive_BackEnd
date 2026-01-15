import {WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect} from "@nestjs/websockets"
import {Server, Socket} from "socket.io";
import { ChatService } from "./chat.service";
import { JoinRoomDto } from "./dto/join_room.dto";
import { CreateMessageDto } from "./dto/create_message.dto";
import { DeleteMessageDto } from "./dto/delete_message.dto";

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
    constructor(private readonly chatService: ChatService) {}

    handleConnection(client: Socket) {
        console.log('채팅 시스템 연결중....' , client.id);
    }

    handleDisconnect(client: Socket) {
        console.log("채팅 시스템 연결 종료...", client.id);
    }

    @SubscribeMessage('chat:join')
    async handleJoin(@MessageBody() dto: JoinRoomDto, @ConnectedSocket() client: Socket){
        const user = client.data.user;
        const peerUserId = Number(dto.peerUserId);

        if(!user?.id) {
            client.emit('chat:error', {message: "로그인이 필요합니다"});
            return;
        }

        if (Number.isNaN(peerUserId)) {
            client.emit('chat:error', { message: '잘못된 사용자 계정 입니다.' });
            return;
        }

        if(peerUserId === user.id) {
            client.emit('chat:error', {message : "자기 자신과는 채팅할 수 없습니다"});
            return;
        }

        let room;
        try {
            room = await this.chatService.getOrCreateDirectRoom(user.id, peerUserId);
        } catch (error) {
            client.emit('chat:error', { message : error.message});
            return;
        }

        client.join(room.id);
        console.log(`[채팅][입장] user=${user.id}, room=${room.id}`);

        client.emit('chat:joined', {roomId : room.id});
    }

    @SubscribeMessage('chat:send')
    async handleSend(@MessageBody() dto: CreateMessageDto, @ConnectedSocket() client: Socket) {
        const user = client.data.user;

        if (!user?.id){
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
            message = await this.chatService.createMessage(dto.roomId, user.id, dto.content);
        } catch (error) {
            client.emit('chat:error', { message: error.message});
            return;
        }
        
        this.server.to(dto.roomId).emit('chat:message', message);

        console.log(`[채팅][전송요청] user=${user.id}, room=${dto.roomId}, content=${dto.content}`);
    }

    @SubscribeMessage('chat:delete')
    async handleDelete(@MessageBody() dto: DeleteMessageDto, @ConnectedSocket() client: Socket){
        const user = client.data.user;

        if(!user?.id){
            client.emit('chat:error', {message: '로그인이 필요합니다'});
            return;
        }

        let deletedMessage;
        try {
            deletedMessage = await this.chatService.deleteMessage(dto.messageId, user.id);
        } catch (error) {
            client.emit('chat:error', {message: error.message});
            return;
        }

        this.server.to(deletedMessage.roomId).emit('chat:deleted', {messageId: deletedMessage.id});

        console.log(`[채팅][삭제] user=${user.id}, message=${deletedMessage.id}`);
    }

}
