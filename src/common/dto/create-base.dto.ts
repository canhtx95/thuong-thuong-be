import { ApiProperty } from '@nestjs/swagger';

export class CreateBaseDto {
  @ApiProperty({ example: 'English' })
  otherLanguage: string;
  @ApiProperty({ example: 'tranh giấy' })
  description: string;

}
