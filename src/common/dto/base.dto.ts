import { ApiProperty } from '@nestjs/swagger'
import { language } from '../constant'

export class BaseDto {
  @ApiProperty({ example: 'EN', default: 'VI' })
  language?: language = language.VIETNAMESE
  @ApiProperty({ example: 'admin' })
  role: string
 
}
