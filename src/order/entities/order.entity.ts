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
import { OrderProductEntity } from './order-product.entity'
@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ nullable: true })
  name: string
  @Column({ nullable: true })
  address: string
  @Column({ nullable: true })
  phone: string
  @Column({ nullable: true })
  email: string
  @Column({ default: 1 })
  status: number
  @Column({ default: false })
  softDeleted: number

  @OneToMany(() => OrderProductEntity, o => o.order, {
    cascade: ['insert','remove'],
  })
  products: OrderProductEntity[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
