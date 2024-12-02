import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return await this.notificationsService.createNotification(createNotificationDto);
  }

  @Get(':userId')
  async getNotificationsForUser(@Param('userId') userId: string) {
    return await this.notificationsService.getNotificationsForUser(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: number) {
    await this.notificationsService.markAsRead(id);
    return "Notification marked as read";
  }
}
