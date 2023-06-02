import { OrderProductEntity } from '../entities/order-product.entity'

export class CreateOrderDto {

  id: number
  name: string
  address: string
  phone: string
  email: string
  quantity: number

  products: OrderProductEntity[]

}
