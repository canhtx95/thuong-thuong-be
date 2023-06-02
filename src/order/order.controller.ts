import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { OrderService } from './order.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { GetOrderDto } from './dto/get-order.dto'
import { UpdateStatusDto } from './dto/update-status.dto'

@Controller('order')
export class OrderController {
  constructor (private readonly orderService: OrderService) {}

  @Post('create')
  async create (@Body() createOrderDto: CreateOrderDto) {
    console.log(createOrderDto)
    return await this.orderService.create(createOrderDto)
  }
  @Post('get')
  async getOrder (@Body() dto: GetOrderDto) {
    return await this.orderService.getOrders(dto)
  }
  @Post('update-status')
  async updateStatus (@Body() dto: UpdateStatusDto) {
    return await this.orderService.updateStatus(dto)
  }

  // @Get()
  // findAll () {
  //   return this.orderService.findAll()
  // }

  // @Get(':id')
  // findOne (@Param('id') id: string) {
  //   return this.orderService.findOne(+id)
  // }

  // @Patch(':id')
  // update (@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto)
  // }

  // @Delete(':id')
  // remove (@Param('id') id: string) {
  //   return this.orderService.remove(+id)
  // }
}
