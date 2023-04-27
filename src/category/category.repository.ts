import { Repository, BaseEntity } from 'typeorm';
import { CategoryEntity } from './entity/category.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class CustomCategoryRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) { }

  async findAll() {
    const data = this.categoryRepository.find({
      select: [
        'id',
        'name',
        'link',
        'isHighlight',
        'isActive',
        'otherLanguage',
        'parent',
        'description',
      ],
    });
    return data;
  }

  async findCategoryByIdOrLink(
    id: number,
    link: string,
  ): Promise<CategoryEntity[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('cate')
      .select([
        'cate.id',
        'cate.name',
        'cate.link',
        'cate.isHighlight',
        'cate.isActive',
        'cate.otherLanguage',
        'cate.parent',
      ])
      .where(`cate.softDeleted = :sd`, {
        sd: false,
      })
      .andWhere(`cate.id =:id OR cate.link=:link`, {
        id: id,
        link: link,
      })
      .orderBy('cate.id')
      .getMany();
    return data;
  }

  async findSubCategoryById(id: number): Promise<CategoryEntity[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('cate')
      .select([
        'cate.id',
        'cate.name',
        'cate.link',
        'cate.isHighlight',
        'cate.isActive',
        'cate.otherLanguage',
        'cate.parent',
      ])
      .where(`cate.softDeleted = :sd`, {
        sd: false,
      })
      .andWhere(`cate.parent LIKE '%:id%'`, {
        id: id,
      })
      .getMany();
    return data;
  }

  async findProductOfCategoryByIdOrLink(
    id: number,
    link: string,
  ): Promise<CategoryEntity[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('cate')
      .select([
        'cate.id',
        'cate.name',
        'cate.link',
        'cate.isHighlight',
        'cate.isActive',
        'cate.otherLanguage',
        'cate.parent',
      ])
      .where(`cate.softDeleted = :sd`, {
        sd: false,
      })
      .andWhere(`cate.parent like '%/:id%' OR cate.link=:link`, {
        id: id,
        link: link,
      })
      .orderBy('cate.id')
      .getMany();
    return data;
  }
}
