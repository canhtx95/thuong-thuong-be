import { BaseEntity } from 'src/common/entity/base.entity'
import { OrderEntity } from 'src/order/entities/order.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm'
@Entity('customer')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ default: '' })
  name: string
  @Column({ default: '' })
  address: string
  @Column({ nullable: true })
  phone: number
  @Column({ default: '' })
  email: string

  @OneToMany(() => OrderEntity, order => order.customer, {
    cascade: ['insert', 'remove'],
  })
  orders: OrderEntity[]
}
