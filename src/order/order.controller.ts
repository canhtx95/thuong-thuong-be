import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderDto } from './dto/get-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @PublicEndpoint()
  @Post('create')
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.create(createOrderDto);
  }
  @Post()
  async getOrder(@Body() dto: GetOrderDto) {
    return await this.orderService.getOrders(dto);
  }
  @Post('update-status')
  async updateStatus(@Body() dto: UpdateStatusDto) {
    return await this.orderService.updateStatus(dto);
  }
}
