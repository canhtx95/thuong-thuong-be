import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ArticleService } from './article.service'
import { CreateArticleDto } from './dto/create-article.dto'
import { BaseResponse } from 'src/common/response/base.response'
import { UpdateArticleDto } from './dto/update-article.dto'
import { getArticleDto } from './dto/get-article.dto'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard'
import { FileInterceptorArticle } from 'src/config/upload-image.config'
import { Multer } from 'multer'

@ApiTags('Bài viết - article')
@UseGuards(JwtAuthGuard)
@Controller('article')
export class ArticleController {
  constructor (private readonly articleService: ArticleService) {}

  // @ApiOperation({ summary: 'Lấy tất cả bài viết' })
  // @Get('')
  // getAllArticle(@Body() dto: getArticleDto): Promise<BaseResponse> {
  //   return this.articleService.getArticleByIdOrLink(dto);
  // }

  @ApiOperation({ summary: 'Xem chi tiết bài viết bằng link hoặc id' })
  @PublicEndpoint()
  @Post('')
  getArticleByIdOrLink (@Body() dto: getArticleDto): Promise<BaseResponse> {
    return this.articleService.getArticleByIdOrLink(dto)
  }

  @ApiOperation({ summary: 'Xem chi tiết bài viết bằng link hoặc id - quyền admin' })
  @Post('/admin-get-detail')
  adminGetArticleByIdOrLink (@Body() dto: getArticleDto): Promise<BaseResponse> {
    return this.articleService.adminGetArticleByIdOrLink(dto)
  }

  @ApiOperation({ summary: 'lấy các bài viết bằng link hoặc id của menu' })
  @PublicEndpoint()
  @Post('get-by-menu')
  getArticleByMenuIdOrLink (@Body() dto: getArticleDto): Promise<BaseResponse> {
    return this.articleService.getArticleByMenuIdOrLink(dto)
  }

  @ApiOperation({ summary: 'lấy các bài viết bằng link hoặc id của menu - quyền admin' })
  @Post('admin-get-by-menu')
  adminGetArticleByMenuIdOrLink (@Body() dto: getArticleDto): Promise<BaseResponse> {
    return this.articleService.adminGetArticleByMenuIdOrLink(dto)
  }


  @ApiOperation({ summary: 'Tạo mới bài viết' })
  @Post('create')
  createArticle (@Body() dto: CreateArticleDto): Promise<BaseResponse> {
    return this.articleService.createArticle(dto)
  }

  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @Post('update')
  updateArticle (@Body() dto: UpdateArticleDto): Promise<BaseResponse> {
    return this.articleService.updateArticle(dto)
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái bài viết' })
  @Post('update-status')
  updateArticleStatus (@Body() dto: UpdateStatusDto): Promise<BaseResponse> {
    return this.articleService.updateArticleStatus(dto)
  }

  @ApiOperation({ summary: 'upload image for article' })
  @Post('upload')
  @UseInterceptors(FileInterceptorArticle)
  async uploadProductImage (
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<any> {
    return files
  }
}
