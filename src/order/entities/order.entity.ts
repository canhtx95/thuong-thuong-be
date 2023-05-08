import { BaseEntity } from 'src/common/entity/base.entity'
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
} from 'typeorm'
// @Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column({ default: '' })
  name: string
  @Column({ default: '' })
  address: string
  @Column({ default: '' })
  phone: number
  @Column({ default: '' })
  email: string
  @Column({ default: 1 })
  status: number
  @Column({ default: false })
  softDeleted: number
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date
}
