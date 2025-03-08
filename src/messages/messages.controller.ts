import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) { }

  @Get()
  async getMessages(
    @Body('userId1') userId1: string,
    @Body('userId2') userId2: string,
  ): Promise<ApiResponseDto<Message[]>> {
    const messages = await this.messageService.getMessagesBetweenUsers(userId1, userId2);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Messages retrieved successfully',
      messages
    );
  }
  //make a controller to send message from sender to receiver
  @Post()
  async sendMessage(
    @Body() message: CreateMessageDto
  ): Promise<ApiResponseDto<Message>> {
    const newMessage = await this.messageService.createMessage(message);
    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Message sent successfully',
      newMessage
    );
  }
}
