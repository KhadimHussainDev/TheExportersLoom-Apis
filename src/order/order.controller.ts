import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<ApiResponseDto<any>> {
    // try {
    const order = await this.orderService.createOrder(createOrderDto);
    return ApiResponseDto.success(
      HttpStatus.CREATED,
      'Order created successfully',
      order
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to create order: ${error.message}`,
    //     error
    //   );
    // }
  }
  @Get('statistics')
  async getOrderStatistics(): Promise<ApiResponseDto<any>> {
    // try {
    const statistics = await this.orderService.getOrderStatistics();
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Order statistics retrieved successfully',
      statistics
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to get order statistics: ${error.message}`,
    //     error
    //   );
    // }
  }
  @Get(':id')
  async getOrderById(@Param('id') orderId: number): Promise<ApiResponseDto<any>> {
    // try {
    const order = await this.orderService.getOrderById(orderId);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Order retrieved successfully',
      order
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to get order by id: ${error.message}`,
    //     error
    //   );
    // }
  }

  @Get()
  async getAllOrders(@Query('userId') userId?: number): Promise<ApiResponseDto<any>> {
    // try {
    if (userId) {
      const userOrders = await this.orderService.getOrdersByUserId(userId);
      return ApiResponseDto.success(
        HttpStatus.OK,
        'User orders retrieved successfully',
        userOrders
      );
    }

    const orders = await this.orderService.getAllOrders();
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Orders retrieved successfully',
      orders
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to get all orders: ${error.message}`,
    //     error
    //   );
    // }
  }


  @Get('statistics/user/:userId')
  async getUserOrderStatistics(@Param('userId') userId: number): Promise<ApiResponseDto<any>> {
    // try {
    const statistics = await this.orderService.getUserOrderStatistics(userId);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'User order statistics retrieved successfully',
      statistics
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to get user order statistics: ${error.message}`,
    //     error
    //   );
    // }
  }


  @Put(':id')
  async updateOrder(
    @Param('id') orderId: number,
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<ApiResponseDto<any>> {
    // try {
    const updatedOrder = await this.orderService.updateOrder(orderId, updateOrderDto);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Order updated successfully',
      updatedOrder
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to update order: ${error.message}`,
    //     error
    //   );
    // }
  }

  @Delete(':id')
  async deleteOrder(@Param('id') orderId: number): Promise<ApiResponseDto<any>> {
    // try {
    const result = await this.orderService.deleteOrder(orderId);
    return ApiResponseDto.success(
      HttpStatus.OK,
      'Order deleted successfully',
      result
    );
    // } catch (error) {
    //   return ApiResponseDto.error(
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //     `Failed to delete order: ${error.message}`,
    //     error
    //   );
    // }
  }
}