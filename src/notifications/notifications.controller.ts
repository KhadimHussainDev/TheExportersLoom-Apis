import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateNotificationDto } from './dtos/create-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  async createNotification(@Body() createNotificationDto: CreateNotificationDto): Promise<ApiResponseDto<any>> {
    const notification = await this.notificationsService.createNotification(createNotificationDto);
    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Notification created successfully',
      notification
    );
  }

  @Get(':userId')
  async getNotificationsForUser(@Param('userId') userId: string): Promise<ApiResponseDto<any>> {
    const notifications = await this.notificationsService.getNotificationsForUser(userId);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Notifications retrieved successfully',
      notifications
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: number): Promise<ApiResponseDto<any>> {
    await this.notificationsService.markAsRead(id);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Notification marked as read'
    );
  }
}
