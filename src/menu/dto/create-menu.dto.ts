import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateBaseDto } from 'src/common/dto/create-base.dto';
export class CreateMenuDto extends CreateBaseDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    link: string;
    isActive: boolean = true;
    parentId: number
    softDeleted: boolean = false;
    priority: number = 0;

}