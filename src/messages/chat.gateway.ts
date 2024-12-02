import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly messageService: MessagesService) { }

    afterInit(server: Server) {
        console.log('WebSocket initialized');
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        // Expect the client to emit a 'join' event with the userId
        client.on('join', (userId: string) => {
            console.log(`User ${userId} joined`);
            client.join(userId); // Join a room named by the userId
        });
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('ping')
    async handlePing(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        console.log('Ping received:', data);
        client.emit('pong', { message: 'pong' });
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() payload: CreateMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        // Save the message to the database
        const message = await this.messageService.createMessage(
            payload
        );
        // Emit the message to the specific receiver room
        client.to(payload.receiverId).emit('newMessage', message);
    }
}
