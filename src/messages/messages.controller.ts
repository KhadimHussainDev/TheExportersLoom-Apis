import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) { }

  @Get()
  async getMessages(
    @Body('userId1') userId1: string,
    @Body('userId2') userId2: string,
  ): Promise<Message[]> {
    return this.messageService.getMessagesBetweenUsers(userId1, userId2);
  }
  //make a controller to send message from sender to receiver
  @Post()
  async sendMessage(
    @Body() message : CreateMessageDto
  ): Promise<Message> {
    return this.messageService.createMessage(message);
  }
}
