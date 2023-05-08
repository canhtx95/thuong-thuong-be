import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateBaseDto } from 'src/common/dto/create-base.dto';
export class CreateArticleDto extends CreateBaseDto{
    @ApiProperty({ example: 'Tranh giay' })
    @IsNotEmpty()
    name: string;
    @ApiProperty({ example: '/tranh-giay' })
    @IsNotEmpty()
    link: string;
    @ApiProperty({ example: '1' })
    menuId: string;
    @ApiProperty({ example: 'tranh giấy' })
    description: string;
    // @ApiProperty()
    // otherLanguage: Map<string, string>;
}
