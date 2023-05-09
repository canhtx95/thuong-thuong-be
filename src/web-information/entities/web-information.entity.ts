import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'
@Entity('web_information')
export class WebInformationEntity {
  @PrimaryGeneratedColumn()
  @Index({ unique: true })
  id: number
  @Column()
  key: string
  @Column()
  value: string
  @Column()
  description: string
}
