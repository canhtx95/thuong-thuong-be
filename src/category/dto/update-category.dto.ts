import { ApiProperty } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
export class UpdateCategoryDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  id: number
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
