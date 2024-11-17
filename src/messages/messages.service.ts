import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }
    async createMessage(payload: CreateMessageDto): Promise<Message> {
        try {
            const message = this.messageRepository.create(payload);
            return await this.messageRepository.save(message);
        } catch (error) {
            console.error('Error creating message:', error);
            throw new Error('Could not create message');
        }
    }
    async getMessagesBetweenUsers(userId1: string, userId2: string) {
        return await this.messageRepository.find({
            where: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 },
            ],
            order: { createdAt: 'ASC' },
        });
    }
}
