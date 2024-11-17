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
            client.data.userId = userId; // Store userId in client data for reference
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
        const roomId = this.getRoomId(payload.senderId, payload.receiverId);
        // Check if the client is already in the room
        if (!client.rooms.has(roomId)) {
            client.join(roomId);
            console.log(`User ${payload.senderId} joined room: ${roomId}`);
        }
        // Save the message to the database
        const message = await this.messageService.createMessage(
            payload
        );
        // Emit the message to the specific room
        client.to(roomId).emit('newMessage', message);
    }
    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, payload: { senderId: string, receiverId: string }) {
        const roomId = this.getRoomId(payload.senderId, payload.receiverId);
        client.join(roomId);
        console.log(`User joined room: ${roomId}`);
    }
    getRoomId(senderId: string, receiverId: string): string {

        return senderId > receiverId ? `${senderId}-${receiverId}` : `${receiverId}-${senderId}`;
    }
}
/**
 * ChatGateway handles WebSocket connections for real-time chat functionality.
 * 
 * This gateway manages the following:
 * - Initializing the WebSocket server
 * - Handling client connections and disconnections
 * - Managing user rooms based on user IDs
 * - Handling specific WebSocket events such as 'ping', 'sendMessage', and 'joinRoom'
 * 
 * WebSocket Events:
 * - 'ping': Used to check the connection status. Responds with 'pong'.
 * - 'sendMessage': Handles sending messages between users. Saves the message to the database and emits it to the appropriate room.
 * - 'joinRoom': Allows users to join a specific chat room based on sender and receiver IDs.
 * 
 * Usage:
 * - Clients should emit a 'join' event with their userId upon connection.
 * - Clients can send messages using the 'sendMessage' event with a payload containing senderId, receiverId, and content.
 * - Clients can join specific rooms using the 'joinRoom' event with a payload containing senderId and receiverId.
 * 
 * Note:
 * - Ensure that the MessagesService is correctly implemented and injected to handle message persistence.
 * - The room ID is generated based on the senderId and receiverId to ensure a consistent room naming convention.
 */
