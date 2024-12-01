import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationsService } from './notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly notificationsService: NotificationsService) { }

  @SubscribeMessage('sendNotification')
  async handleNotification(
    @MessageBody() payload: CreateNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const notification = await this.notificationsService.createNotification(payload);
    this.server.to(payload.userId).emit('newNotification', notification);
  }
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(userId)
    client.join(userId);
    console.log(`User with ID ${userId} joined the room.`);
  }
}