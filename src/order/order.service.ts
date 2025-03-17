import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BidService } from '../bid/bid.service';
import { STATUS } from '../common';
import { MachineService } from '../machines/machine.service';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @Inject(forwardRef(() => BidService))
    private readonly bidService: BidService,

    @Inject(forwardRef(() => UsersService))
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

    // Validate bid status - allow ACTIVE or ACCEPTED bids
    if (bid.status !== STATUS.ACTIVE && bid.status !== STATUS.ACCEPTED) {
      throw new BadRequestException(`Cannot create order: Bid is not ${STATUS.ACTIVE} or ${STATUS.ACCEPTED}`);
    }

    // Create and save the order
    const newOrder = this.orderRepository.create({
      bid,
      exporter,
      manufacturer,
      machine,
      ...rest,
    });

    // Deactivate the bid after creating the order if it's still active
    if (bid.status === STATUS.ACTIVE) {
      await this.bidService.deactivateBid(bidId);
    }

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

  async getOrdersByUserId(userId: number): Promise<any[]> {
    // Validate user exists
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get orders where user is either exporter or manufacturer
    const orders = await this.orderRepository.find({
      where: [
        { exporter: { user_id: userId } },
        { manufacturer: { user_id: userId } }
      ],
      relations: ['exporter', 'manufacturer', 'bid']
    });

    // Transform orders to include only the required fields
    return orders.map(order => {
      // Calculate completion percentage based on status
      let completionPercentage = 0;
      if (order.status) {
        const lowerStatus = order.status.toLowerCase();
        if (lowerStatus.includes('completed')) {
          completionPercentage = 100;
        } else if (lowerStatus.includes('active')) {
          completionPercentage = 50; // Default for active
        } else if (lowerStatus.includes('pending')) {
          completionPercentage = 25; // Default for pending
        }
      }

      return {
        id: order.orderId,
        orderId: `Order#${order.orderId}`, // Using order ID as the order name
        exporterName: order.exporter?.username || 'Unknown Exporter',
        price: order.bid?.price || 0, // Using bid price
        deadline: order.deadline,
        status: order.status,
        completionPercentage: completionPercentage
      };
    });
  }

  async getOrderStatistics(): Promise<any> {
    const orders = await this.orderRepository.find();

    return this.calculateOrderStatistics(orders);
  }

  async getUserOrderStatistics(userId: number): Promise<any> {
    // Validate user exists
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get user orders
    const userOrders = await this.getOrdersByUserId(userId);

    return this.calculateOrderStatistics(userOrders);
  }

  private calculateOrderStatistics(orders: Order[]): any {
    let completed = 0;
    let ongoing = 0;
    let todo = 0;

    orders.forEach(order => {
      if (order.status === STATUS.COMPLETED) {
        completed++;
      } else if (order.status === STATUS.ACTIVE) {
        ongoing++;
      } else if (order.status === STATUS.DRAFT || order.status === STATUS.PENDING) {
        todo++;
      }
      else {
        console.log(order.status);
      }
    });

    const total = orders.length;


    return {
      completedPercentage: total > 0 ? (completed / total) * 100 : 0,
      ongoingPercentage: total > 0 ? (ongoing / total) * 100 : 0,
      todoPercentage: total > 0 ? (todo / total) * 100 : 0,
      total,
      completed,
      ongoing,
      todo
    };
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