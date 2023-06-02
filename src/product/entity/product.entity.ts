import { Exclude } from 'class-transformer'
import { CategoryEntity } from 'src/category/entity/category.entity'
import { OrderProductEntity } from 'src/order/entities/order-product.entity'
import { OrderEntity } from 'src/order/entities/order.entity'
import { ProductContentEntity } from 'src/product/entity/product-content.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'

@Entity({ name: 'product' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column()
  link: string
  @Column({ default: true })
  isActive: boolean
  @Column({ nullable: true })
  price: number
  @Column({ name: 'soft_deleted', default: false })
  softDeleted: boolean
  @Column({ name: 'img_link', nullable: true })
  imageUrl: string

  @Column({ name: 'category_id' })
  categoryId: string
  @ManyToOne(() => CategoryEntity, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity

  @OneToMany(() => ProductContentEntity, content => content.product, {
    cascade: ['insert', 'update'],
  })
  content: ProductContentEntity[]
  @Exclude()
  @OneToMany(() => OrderProductEntity, order => order.product, {
    cascade: ['update', 'remove'],
  })
  order: OrderProductEntity[]

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
