import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class CreateMenuDto {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    link: string;
    isActive: boolean = true;
    parentId: number
    otherLanguage: string;
    softDeleted: boolean = false;
    priority: number = 0;

}