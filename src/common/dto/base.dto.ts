import { ApiProperty } from '@nestjs/swagger'
import { language } from '../constant'
import { Pagination } from '../service/pagination.service'

export class BaseDto {
  @ApiProperty({ example: 'EN', default: 'VI' })
  language?: language = language.VIETNAMESE
  
  page: number = 1
  size: number = 20
  pagination: Pagination

}
