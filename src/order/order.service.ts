import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateStatusDto } from './dto/update-status.dto'
import { plainToClass } from 'class-transformer'
import { OrderEntity } from './entities/order.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProductEntity } from 'src/product/entity/product.entity'
import { BaseResponse } from 'src/common/response/base.response'
import { GetOrderDto } from './dto/get-order.dto'
import { Pagination } from 'src/common/service/pagination.service'

@Injectable()
export class OrderService {
  constructor (
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create (dto: CreateOrderDto) {
    try {
      dto.products.forEach(e => {
        if (e.quantity <= 0) throw new Error('Số lượng sản phẩm không hợp lệ')
      })
      const order = plainToClass(OrderEntity, dto)
      const res = await this.orderRepository.save(order)
      return new BaseResponse('Tạo đơn hàng thành công', res, 200)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  async updateStatus (dto: UpdateStatusDto) {
    try {
      const order = plainToClass(OrderEntity, dto)
      const res = await this.orderRepository.save(order)
      return new BaseResponse(
        'Cập nhật trạng thái đơn hàng thành công',
        res,
        200,
      )
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  async getOrders (dto: GetOrderDto) {
    try {
      let searchById = 'AND order.id IN (:id)'
      let searchByStatus = 'AND order.status = :status'
      let searchByName = `AND order.name LIKE :name`
      let searchByEmail = `AND order.email LIKE :email`
      let searchByPhone = `AND order.phone LIKE :phone`

      if (!dto.ids) {
        searchById = ''
      }
      if (!dto.status) {
        searchByStatus = ''
      }
      if (!dto.email) {
        searchByEmail = ''
      }
      if (!dto.phone) {
        searchByPhone = ''
      }
      if (!dto.name) {
        searchByName = ''
      }
      const pagination = new Pagination(dto.page, dto.size)
      const data = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.products', 'extens')
        .innerJoinAndSelect('extens.product', 'product')
        .innerJoinAndSelect(
          'product.content',
          'content',
          'content.language = :language',
          { language: dto.language },
        )
        .where(
          `order.softDeleted = 0 ${searchById} ${searchByStatus} ${searchByName} ${searchByEmail} ${searchByPhone} `,
          {
            id: dto.ids,
            status: dto.status,
            email: `%${dto.email}%`,
            phone: `%${dto.phone}%`,
            name: `%${dto.name}%`,
          },
        )
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount()
      const orders = data[0].map(order => {
        const products = order.products.map(p => {
          const id = p.product.id
          const name = p.product.content[0].name
          const quantity = p.quantity
          const imageUrl = p.product.imageUrl
          const isActive = p.product.isActive
          const link = p.product.link
          return {
            id,
            name,
            quantity,
            imageUrl,
            isActive,
            link,
          }
        })
        return { ...order, products }
      })
      pagination.createResult(data[1])
      return new BaseResponse('Thông tin đơn hàng', {
        orders: orders,
        pagination,
      })
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
