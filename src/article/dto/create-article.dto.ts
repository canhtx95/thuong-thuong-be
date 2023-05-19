import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreateBaseDto } from 'src/common/dto/create-base.dto'
import { ArticleEntity } from '../entity/article.entity'
import { ArticleContentEntity } from '../entity/article-content.entity'
export class CreateArticleDto {
  // @ApiProperty({ example: 'Tranh giay' })
  // @IsNotEmpty()
  // name: string;
  @ApiProperty({ example: '/tranh-giay' })
  @IsNotEmpty()
  link: string
  @ApiProperty({ example: '1' })
  menuId: string
  @ApiProperty({ example: 'tranh giấy' })
  description: string
  // @ApiProperty()
  // otherLanguage: Map<string, string>;
  @IsNotEmpty()
  content: ArticleContentEntity[]
  imgLink: string

}
