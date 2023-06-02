import { PartialType } from '@nestjs/swagger'
import { CreateOrderDto } from './create-order.dto'
import { BaseDto } from 'src/common/dto/base.dto'

export class GetOrderDto extends BaseDto {
  ids: number[]
  status: number
  phone: string
  email: string
  name: string
}
