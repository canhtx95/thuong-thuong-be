import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';
export class getCategoryDto extends BaseDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: '/tranh-giay' })
  link: string;

}
