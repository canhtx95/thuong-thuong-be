import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseResponse } from 'src/common/response/base.response';
import {
    HttpException,
    HttpStatus,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { getArticleDto } from './dto/get-article.dto';
import { plainToClass } from 'class-transformer';
import { UpdateStatusDto } from 'src/common/dto/update-status.dto';
import { CommonService } from 'src/common/service/service.common';
@Injectable()
export class ArticleService extends CommonService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        private readonly dataSource: DataSource
    ) {
        super();
    }
    async getArticleByMenuIdOrLink(dto: getArticleDto): Promise<BaseResponse> {
        try {
            let articles = await this.articleRepository.createQueryBuilder('art')
                .leftJoin('art.menu', 'menu', 'menu.softDeleted = false')
                .where('art.softDeleted = false')
                .andWhere('(menu.id =:id OR menu.link =:link)', { id: dto.id, link: dto.link })
                .getMany()
            if (articles) {
                // article = article.isActive == true ? article : null
                articles = articles.filter(a => a.isActive == true)
            } else {
                throw new Error('Bài viết không tồn tại')
            }
            for (const article of articles) {
                const name = this.getNameMultiLanguage(dto.language, article.otherLanguage);
                article.name = name ? name : article.name
                delete article.otherLanguage
            }
            const response = new BaseResponse(
                'Lấy dữ liệu thành công',
                articles,
            );
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
    async getArticleByIdOrLink(dto: getArticleDto): Promise<BaseResponse> {
        try {
            let article = await this.articleRepository.createQueryBuilder('art')
                .leftJoinAndSelect('art.content', 'content')
                .where('art.softDeleted = false')
                .andWhere('(art.id =:id OR art.link =:link)', { id: dto.id, link: dto.link })
                .getOne()
            if (article) {
                article = article.isActive == true ? article : null
            } else {
                throw new Error('Bài viết không tồn tại')
            }
            const name = this.getNameMultiLanguage(dto.language, article.otherLanguage);
            article.name = name ? name : article.name
            article.content = this.getContentMultiLanguage(dto.language, article.content);
            delete article.otherLanguage
            const response = new BaseResponse(
                'Lấy dữ liệu thành công',
                article,
            );
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async createArticle(dto: CreateArticleDto): Promise<BaseResponse> {
        try {
            let result;
            await this.dataSource.manager.transaction(async (transaction) => {
                const repository = transaction.getRepository(ArticleEntity)
                const checkLink = await repository.findOneBy({ link: dto.link })
                if (checkLink) {
                    throw new Error('Đường dẫn đã tồn tại')
                }
                const article = plainToClass(ArticleEntity, dto)
                // article.otherLanguage = article.otherLanguage
                result = await repository.save(article)
            })
            const response = new BaseResponse(
                'Tạo bài viết thành công ',
                result,
            );
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async updateArticle(dto: UpdateArticleDto): Promise<BaseResponse> {
        try {
            let result;
            await this.dataSource.manager.transaction(async (transaction) => {
                const repository = transaction.getRepository(ArticleEntity)
                const checkLink = await repository.findOneBy({ link: dto.link })
                if (checkLink && checkLink.id != dto.id) {
                    throw new Error('Đường dẫn đã tồn tại')
                }
                const article = plainToClass(ArticleEntity, dto)
                result = await repository.save(article)
                throw new Error('aasd')
            })
            const response = new BaseResponse(
                'Cập nhật bài viết thành công',
                result,
            );
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async updateArticleStatus(dto: UpdateStatusDto): Promise<BaseResponse> {
        try {
            let result;
            await this.dataSource.manager.transaction(async (transaction) => {
                const repository = transaction.getRepository(ArticleEntity)
                const article = plainToClass(ArticleEntity, dto)
                result = await repository.save(article)
            })
            const response = new BaseResponse(
                'Cập nhật bài viết thành công',
                result,
            );
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
