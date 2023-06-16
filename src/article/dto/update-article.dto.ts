import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ArticleEntity } from '../entity/article.entity'
import { ArticleContentEntity } from '../entity/article-content.entity'
export class UpdateArticleDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number
  @ApiProperty({ example: 'Tranh giay' })
  name: string
  @ApiProperty({ example: '/tranh-giay' })
  link: string
  @ApiProperty({ example: '1', default: '' })
  @IsNotEmpty()
  menuId: number
  @ApiProperty({ example: 'tranh giấy' })
  description: string
  @ApiProperty()
  otherLanguage: Object
  @ApiProperty()
  imageUrl: string
  content: ArticleContentEntity[]
}
