import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BidService } from 'bid/bid.service';
import { MachineService } from 'machines/machine.service';
import { Repository } from 'typeorm';
import { UsersService } from 'users/users.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';


@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly bidService: BidService,
    private readonly userService: UsersService,
    private readonly machineService: MachineService,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { bidId, exporterId, manufacturerId, machineId, ...rest } = createOrderDto;

    const bid = await this.bidService.findOne(bidId);
    const exporter = await this.userService.findOne(exporterId);
    const manufacturer = await this.userService.findOne(manufacturerId);
    const machine = await this.machineService.findOne(machineId);
    console.log(exporter, manufacturer);
    const newOrder = this.orderRepository.create({
      bid,
      exporter,
      manufacturer,
      machine,
      ...rest,
    });

    return await this.orderRepository.save(newOrder);
  }

  async getOrderById(orderId: number) {
    return await this.orderRepository.findOne({
      where: { orderId },
      relations: ['bid', 'exporter', 'manufacturer', 'machine'],
    });
  }

  async getAllOrders() {
    return await this.orderRepository.find({ relations: ['bid', 'exporter', 'manufacturer', 'machine'] });
  }

  async updateOrder(orderId: number, updateOrderDto: Partial<Order>) {


    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    Object.assign(order, updateOrderDto);

    return await this.orderRepository.save(order);
  }
  // async deleteOrder(orderId: number): Promise<void> {
  //   await this.orderRepository.delete(orderId);
  // }
  async deleteOrder(orderId: number) {
    try {
      await this.updateOrder(orderId, { status: 'deleted' });
      return { message: 'Order deleted successfully' };
    } catch (error) {
      return { message: `Failed to delete order: ${error.message}` };
    }
  }
}