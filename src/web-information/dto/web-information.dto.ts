import { IsNotEmpty } from 'class-validator'

export class WebInformationDto {
  id: number
  @IsNotEmpty()
  key: string
  @IsNotEmpty()
  value: string
  @IsNotEmpty()
  description: string
}
