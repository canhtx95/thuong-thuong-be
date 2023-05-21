import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
export class CreateCategoryDto {
  @ApiProperty({ example: 'Tranh giay' })
  @IsNotEmpty()
  name: any
  @ApiProperty({ example: '/tranh-giay' })
  @IsNotEmpty()
  link: string
  @ApiProperty({ example: '1', default: '' })
  parent: string
  @ApiProperty({ example: 'tranh giấy' })
  description: string
  @ApiProperty()
  otherLanguage: Object
}
