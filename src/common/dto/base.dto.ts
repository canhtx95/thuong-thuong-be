import { ApiProperty } from '@nestjs/swagger'
import { language } from '../constant'

export class BaseDto {
  @ApiProperty({ example: 'EN', default: 'VI' })
  language: language
  @ApiProperty({ example: 'admin' })
  role: string
}


