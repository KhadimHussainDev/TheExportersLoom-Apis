import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { ChatGateway } from './chat.gateway';

@Module({
  imports : [TypeOrmModule.forFeature([Message])],
  controllers: [MessagesController],
  providers: [MessagesService, ChatGateway]
})
export class MessagesModule {}
