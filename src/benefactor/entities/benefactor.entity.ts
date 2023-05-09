import { BaseEntity } from 'src/common/entity/base.entity'
import { OrderEntity } from 'src/order/entities/order.entity'
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
@Entity('benefactor')
export class BenefactorEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column()
  name: string
  @Column()
  asset: string
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
