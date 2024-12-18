import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await this.orderService.createOrder(createOrderDto);
    } catch (error) {
      return { statusCode: 500, message: `Failed to create order: ${error.message}` };
    }
  }

  @Get(':id')
  async getOrderById(@Param('id') orderId: number) {
    try {
      return await this.orderService.getOrderById(orderId);
    } catch (error) {
      return { statusCode: 500, message: `Failed to get order by id: ${error.message}` };
    }
  }

  @Get()
  async getAllOrders() {
    try {
      return await this.orderService.getAllOrders();
    } catch (error) {
      return { statusCode: 500, message: `Failed to get all orders: ${error.message}` };
    }
  }

  @Put(':id')
  async updateOrder(@Param('id') orderId: number, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.orderService.updateOrder(orderId, updateOrderDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id') orderId: number) {
    try {
      return await this.orderService.deleteOrder(orderId);
    } catch (error) {
      return { statusCode: 500, message: `Failed to delete order: ${error.message}` };
    }
  }
}