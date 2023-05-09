import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { CustomerEntity } from './entities/customer.entity'
import { DataSource, Repository } from 'typeorm'
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { BaseResponse } from 'src/common/response/base.response'
import { raw } from 'express'
@Injectable()
export class CustomerService {
  constructor (
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    private readonly dataSource: DataSource,
  ) {}
  async create (dto: CreateCustomerDto) {
    try {
      let result: CustomerEntity
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(CustomerEntity)
        const customerOrder = plainToClass(CustomerEntity, dto)
        result = await repository.save(customerOrder)
      })
      const response = new BaseResponse(' Tạo đơn hàng thành công ', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll (): Promise<any> {
    return await this.customerRepository.find()
  }

  async findOne (id: number): Promise<BaseResponse> {
    try {
      const result = await this.customerRepository
        .createQueryBuilder('customer')
        .leftJoinAndSelect('customer.orders', 'order')
        .leftJoinAndSelect('order.product', 'product')
        .where('customer.id = :id', { id })
        .select([
          'customer.name',
          'customer.phone',
          'customer.email',
          'customer.address',
          'order.id',
          'order.quantity',
          'product.name',
        ])
        .addSelect(['order.id', 'order.quantity', 'product.name'])
        .getRawOne()

      const response = new BaseResponse(' Khách hàng', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  update (id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`
  }

  remove (id: number) {
    return `This action removes a #${id} customer`
  }
}
