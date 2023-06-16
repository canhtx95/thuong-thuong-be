import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MinLength } from 'class-validator'
import { BaseDto } from 'src/common/dto/base.dto'
export class getArticleDto extends BaseDto {
  @ApiProperty({ example: 1 })
  id: number
  @ApiProperty({ example: '/tranh-giay' })
  link: string

  name: string
  status: boolean
  fromDate: Date
  toDate: Date
}
