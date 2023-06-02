import { isNotEmpty } from 'class-validator'
import { BaseEntity } from 'src/common/entity/base.entity'
import { ProductEntity } from 'src/product/entity/product.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { OrderEntity } from './order.entity'
@Entity('order_product')
export class OrderProductEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number

  @Column({ name: 'product_id' })
  productId: number
  @Column({ name: 'order_id' })
  orderId: number
  @Column({ nullable: true })
  quantity: number

  @ManyToOne(() => OrderEntity, order => order.products)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity

  @ManyToOne(() => ProductEntity, product => product.order, {
    cascade: ['update'],
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity
}
