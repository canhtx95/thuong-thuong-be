import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { UpdateStatusDto } from 'src/common/dto/update-status.dto';
export class UpdateCategoryStatusDto extends UpdateStatusDto {
  @ApiProperty({ example: true })
  isHighlight: boolean;


}
