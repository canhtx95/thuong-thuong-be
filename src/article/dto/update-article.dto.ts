import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class UpdateArticleDto {
    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    id: number;
    @ApiProperty({ example: 'Tranh giay' })
    name: string;
    @ApiProperty({ example: '/tranh-giay' })
    link: string;
    @ApiProperty({ example: '1', default: '' })
    parent: string;
    @ApiProperty({ example: 'tranh giấy' })
    description: string;
    @ApiProperty()
    otherLanguage: Object;
}
