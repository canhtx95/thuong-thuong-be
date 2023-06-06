import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'
@Entity('web_information')
export class WebInformationEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column()
  key: string
  @Column({ type: 'text' })
  value: string
  @Column()
  description: string
}
