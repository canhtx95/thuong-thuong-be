import { ApiProperty } from '@nestjs/swagger'

export class CreateBaseDto {
  @ApiProperty({ example: 'English', nullable: true })
  otherLanguage: string
  @ApiProperty({ example: 'tranh giấy', nullable: true })
  description: string
}
