import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    senderId: string;

    @Column()
    receiverId: string;

    @Column()
    content: string;

    @CreateDateColumn()
    createdAt: Date;
}
