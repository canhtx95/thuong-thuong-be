import { OrderEntity } from "src/order/entities/order.entity"

export class CreateCustomerDto {
  id: number
  name: string
  address: string
  phone: number
  email: string

  orders: OrderEntity[];
}
