import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class UpdateStatusDto {
  @ApiProperty({ example: 1 })
  id: number
  ids: number[]
  @ApiProperty({ example: true })
  isActive: boolean

  @ApiProperty({ example: true })
  softDeleted: boolean
}
