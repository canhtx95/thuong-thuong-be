import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class UpdateCategoryStatusDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  softDeleted: boolean;

  @ApiProperty({ example: true })
  isHighlight: boolean;


}
