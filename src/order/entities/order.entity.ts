import { isNotEmpty } from 'class-validator'
import { BaseEntity } from 'src/common/entity/base.entity'
import { CustomerEntity } from 'src/customer/entities/customer.entity'
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
} from 'typeorm'
@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ name: 'product_id' })
  productId: number
  @Column({ name: 'customer_id' })
  customerId: number
  @Column()
  quantity: number
  @Column({ default: 1 })
  status: number
  @Column({ default: false })
  softDeleted: number

  @ManyToOne(() => CustomerEntity, customer => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity

  @OneToOne(() => ProductEntity, product => product.order)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
