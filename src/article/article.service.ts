import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { ArticleEntity } from './entity/article.entity'
import { DataSource, Repository } from 'typeorm'
import { BaseResponse } from 'src/common/response/base.response'
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'
import { getArticleDto } from './dto/get-article.dto'
import { plainToClass } from 'class-transformer'
import { UpdateStatusDto } from 'src/common/dto/update-status.dto'
import { CommonService } from 'src/common/service/service.common'
import { MenuEntity } from 'src/menu/entity/menu.entity'
@Injectable()
export class ArticleService extends CommonService {
  constructor (
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepository: Repository<MenuEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super()
  }
  async getArticleByMenuIdOrLink (dto: getArticleDto): Promise<BaseResponse> {
    try {
      const menuTreeRepository =
        await this.dataSource.manager.getTreeRepository(MenuEntity)

      const menuDto = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.softDeleted = false AND menu.isActive = true')
        .andWhere('(menu.id =:id OR menu.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!menuDto) {
        throw new Error('Menu không tồn tại')
      }
      const menuAncestor = await menuTreeRepository.findAncestors(menuDto)
      if (
        menuAncestor.some(e => e.isActive == false || e.softDeleted == true)
      ) {
        throw new Error('Menu không tồn tại')
      }
      const menuDescendants = await menuTreeRepository.findDescendants(menuDto)
      const menuDescendantsId = menuDescendants.map(e => e.id)
      let articles = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoin(
          'menu.articles',
          'art',
          'art.softDeleted = false AND art.isActive = true',
        )
        .select(['art', 'menu.link', 'menu.name'])
        .where('menu.softDeleted = false AND menu.isActive = true')
        .andWhere('menu.id IN (:id)', {
          id: menuDescendantsId,
        })
        .getRawMany()

      for (const article of articles) {
        const name = this.getNameMultiLanguage(
          dto.language,
          article.otherLanguage,
        )
        article.name = name ? name : article.name
        delete article.art_other_language
        delete article.art_isActive
        delete article.art_soft_deleted
      }
      const response = new BaseResponse('Lấy dữ liệu thành công', {
        menu: menuDto,
        articles,
      })
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetArticleByMenuIdOrLink (
    dto: getArticleDto,
  ): Promise<BaseResponse> {
    try {
      const menuTreeRepository =
        await this.dataSource.manager.getTreeRepository(MenuEntity)

      const menuDto = await this.menuRepository
        .createQueryBuilder('menu')
        .where('menu.softDeleted = false')
        .andWhere('(menu.id =:id OR menu.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!menuDto) {
        throw new Error('Menu không tồn tại')
      }
      const menuAncestor = await menuTreeRepository.findAncestors(menuDto)
      if (
        menuAncestor.some(e => e.isActive == false || e.softDeleted == true)
      ) {
        throw new Error('Menu không tồn tại')
      }
      const menuDescendants = await menuTreeRepository.findDescendants(menuDto)
      const menuDescendantsId = menuDescendants.map(e => e.id)
      let articles = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoin('menu.articles', 'art', 'art.softDeleted = false')
        .select(['art', 'menu.link', 'menu.name'])
        .where('menu.softDeleted = false')
        .andWhere('menu.id IN (:id)', {
          id: menuDescendantsId,
        })
        .getRawMany()

      const response = new BaseResponse('Lấy dữ liệu thành công', articles)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
  async getArticleByIdOrLink (dto: getArticleDto): Promise<BaseResponse> {
    try {
      let article = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect(
          'art.menu',
          'menu',
          'menu.softDeleted = false AND menu.isActive = true',
        )
        .leftJoinAndSelect('art.content', 'content')
        .where('art.softDeleted = false AND art.isActive = true')
        .andWhere('(art.id =:id OR art.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!article) {
        throw new Error('Bài viết không tồn tại')
      }
      const menuAncestor = await this.dataSource.manager
        .getTreeRepository(MenuEntity)
        .findAncestors(article.menu)
      if (
        menuAncestor.some(e => e.softDeleted == true || e.isActive == false)
      ) {
        throw new Error('Bài viết không tồn tại')
      }
      const name = this.getNameMultiLanguage(
        dto.language,
        article.otherLanguage,
      )
      article.name = name ? name : article.name
      const transformLanguage = this.getContentMultiLanguage(
        dto.language,
        article.content,
      )
      article.content = transformLanguage.content
      article.description = transformLanguage.description

      delete article.otherLanguage
      const response = new BaseResponse('Lấy dữ liệu thành công', article)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async adminGetArticleByIdOrLink (dto: getArticleDto): Promise<BaseResponse> {
    try {
      let article = await this.articleRepository
        .createQueryBuilder('art')
        .innerJoinAndSelect('art.menu', 'menu', 'menu.softDeleted = false')
        .leftJoinAndSelect('art.content', 'content')
        .where('art.softDeleted = false')
        .andWhere('(art.id =:id OR art.link =:link)', {
          id: dto.id,
          link: dto.link,
        })
        .getOne()
      if (!article) {
        throw new Error('Bài viết không tồn tại')
      }
      const menuAncestor = await this.dataSource.manager
        .getTreeRepository(MenuEntity)
        .findAncestors(article.menu)
      if (menuAncestor.some(e => e.softDeleted == true)) {
        throw new Error('Bài viết không tồn tại')
      }
      const response = new BaseResponse('Lấy dữ liệu thành công', article)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async createArticle (dto: CreateArticleDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const checkLink = await repository.findOneBy({ link: dto.link })
        if (checkLink) {
          throw new Error('Đường dẫn đã tồn tại')
        }
        const article = plainToClass(ArticleEntity, dto)
        // article.otherLanguage = article.otherLanguage
        result = await repository.save(article)
      })
      const response = new BaseResponse('Tạo bài viết thành công ', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateArticle (dto: UpdateArticleDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const checkLink = await repository.findOneBy({ link: dto.link })
        if (checkLink && checkLink.id != dto.id) {
          throw new Error('Đường dẫn đã tồn tại')
        }
        const menu = await transaction
          .getRepository(MenuEntity)
          .findOneBy({ id: dto.menuId })
        let menuAncestor = await transaction
          .getTreeRepository(MenuEntity)
          .findAncestors(menu)
        for (const m of menuAncestor) {
          if (m.softDeleted == true) throw new Error('Menu không tồn tại')
        }
        const article = plainToClass(ArticleEntity, dto)
        result = await repository.save(article)
      })
      const response = new BaseResponse('Cập nhật bài viết thành công', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async updateArticleStatus (dto: UpdateStatusDto): Promise<BaseResponse> {
    try {
      let result
      await this.dataSource.manager.transaction(async transaction => {
        const repository = transaction.getRepository(ArticleEntity)
        const article = plainToClass(ArticleEntity, dto)
        result = await repository.save(article)
      })
      const response = new BaseResponse('Cập nhật bài viết thành công', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
