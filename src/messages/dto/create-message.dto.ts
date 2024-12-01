import { IsString } from "class-validator";

export class CreateMessageDto {
    @IsString()
    senderId: string;
    @IsString()
    receiverId: string;
    @IsString()
    content: string;
}
