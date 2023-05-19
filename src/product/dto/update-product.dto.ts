import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreateProductDto } from './create-product.dto'

export class UpdateProductDto extends CreateProductDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number

  @ApiProperty({ example: true })
  isActive: boolean

  @ApiProperty({ example: true })
  softDeleted: boolean
}
