import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateMenuDto } from './create-menu.dto';
export class UpdateMenuDto extends CreateMenuDto {
    @IsNotEmpty()
    id: number

}