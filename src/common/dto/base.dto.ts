import { ApiProperty } from '@nestjs/swagger';

export class BaseDto {
  @ApiProperty({ example: 'EN', default: 'VI' })
  language: string = 'VI';
  @ApiProperty({ example: 'admin' })
  role: string;
}
