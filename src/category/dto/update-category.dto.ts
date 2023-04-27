import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty} from 'class-validator';
export class UpdateCategoryDto {
  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  id: number;
  @ApiProperty({ example: 'Tranh giay' })
  @IsNotEmpty()
  name: string;
  @ApiProperty({ example: '/tranh-giay' })
  @IsNotEmpty()
  link: string;
  @ApiProperty({ example: '1', default: '' })
  @IsNotEmpty()
  parent: string;
  @ApiProperty({ example: 'tranh giấy' })
  description: string;
  @ApiProperty()
  otherLanguage: Object;
}
