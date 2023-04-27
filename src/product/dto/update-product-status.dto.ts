import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateProductStatusDto {

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: true })
  isActive: number;

  @ApiProperty({ example: true })
  softDeleted: number;
}
