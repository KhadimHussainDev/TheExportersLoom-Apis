import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BidService } from 'bid/bid.service';
import { MachineService } from 'machines/machine.service';
import { Repository } from 'typeorm';
import { UsersService } from 'users/users.service';
import { STATUS } from '../common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
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

    // Validate all required entities exist
    const bid = await this.bidService.findOne(bidId);
    if (!bid) {
      throw new NotFoundException(`Bid with ID ${bidId} not found`);
    }

    const exporter = await this.userService.findOne(exporterId);
    if (!exporter) {
      throw new NotFoundException(`Exporter with ID ${exporterId} not found`);
    }

    const manufacturer = await this.userService.findOne(manufacturerId);
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${manufacturerId} not found`);
    }

    const machine = await this.machineService.findOne(machineId);
    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    // Validate bid status
    if (bid.status !== STATUS.ACTIVE) {
      throw new BadRequestException(`Cannot create order: Bid is not ${STATUS.ACTIVE}`);
    }

    // Create and save the order
    const newOrder = this.orderRepository.create({
      bid,
      exporter,
      manufacturer,
      machine,
      ...rest,
    });

    // Deactivate the bid after creating the order
    await this.bidService.deactivateBid(bidId);

    return await this.orderRepository.save(newOrder);
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: ['bid', 'exporter', 'manufacturer', 'machine'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['bid', 'exporter', 'manufacturer', 'machine'],
    });
  }

  async updateOrder(orderId: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.getOrderById(orderId);

    // Update the order with the new data
    const updatedOrder = this.orderRepository.merge(order, updateOrderDto);

    return await this.orderRepository.save(updatedOrder);
  }

  async deleteOrder(orderId: number): Promise<{ message: string }> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await this.orderRepository.remove(order);

    return { message: `Order with ID ${orderId} has been deleted` };
  }
}