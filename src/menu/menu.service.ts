import {
    HttpException,
    HttpStatus,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { MenuEntity } from './entity/menu.entity';
import { DataSource, Repository } from 'typeorm';
import { BaseResponse } from 'src/common/response/base.response';
import { CreateMenuDto } from './dto/create-menu.dto';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';
import { plainToClass } from 'class-transformer';

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(MenuEntity)
        private readonly menuRepository: Repository<MenuEntity>,
        private readonly managerTransaction: DatabaseTransactionManagerService,
        @InjectDataSource()
        private readonly dataSource: DataSource,

    ) { }

    async getMenuById(id: number): Promise<BaseResponse> {
        try {
            const menu = await this.menuRepository.findOneBy({ id: id });
            return new BaseResponse('Danh sách danh mục sản phẩm', menu, 200);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    // async getAllMenu(): Promise<BaseResponse> {
    //     try {
    //         const subMenus = await this.menuRepository.createQueryBuilder('menu')
    //             .leftJoinAndSelect('menu.subMenu', 'sub_lev1')
    //             .leftJoinAndSelect('sub_lev1.subMenu', 'sub_lev2')
    //             .leftJoinAndSelect('sub_lev2.subMenu', 'sub_lev3')
    //             .leftJoinAndSelect('sub_lev2.subMenu', 'sub_lev3')
    //             .getMany();
    //         const result = subMenus.filter(e => !e.parentId)
    //         return new BaseResponse('Danh sách danh mục sản phẩm', result, 200);
    //     } catch (error) {
    //         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    //     }

    // }

    async getAllMenu(): Promise<BaseResponse> {
        try {
            // const data = await this.menuRepository.find({ relations: ['subMenu', 'subMenu.subMenu', 'subMenu.subMenu.subMenu'] })
            // console.log(data)
            // const result = data.filter(e => !e.parent)
            const result = await this.dataSource.manager.getTreeRepository(MenuEntity).findTrees()
            return new BaseResponse('Danh sách danh mục sản phẩm', result, 200);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    async updateMenu(dto: CreateMenuDto): Promise<BaseResponse> {
        const queryRunner = await this.managerTransaction.createTransaction();
        try {
            const menuRepositoryTransaction =
                queryRunner.manager.getRepository(MenuEntity);
            dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`;
            await this.validateCreateMenu(dto)
            const menu = plainToClass(MenuEntity, dto)
            const result = await menuRepositoryTransaction.save(menu)
            await this.managerTransaction.commit();
            const response = new BaseResponse(
                'Tạo danh mục thành công',
                result,
            );
            return response;
        } catch (error) {
            await this.managerTransaction.rollBack();
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async createMenu(dto: CreateMenuDto): Promise<BaseResponse> {
        const queryRunner = await this.managerTransaction.createTransaction();
        try {
            const menuRepositoryTransaction =
                queryRunner.manager.getRepository(MenuEntity);
            dto.link = dto.link.startsWith('/') ? dto.link : `/${dto.link}`;
            await this.validateCreateMenu(dto)
            const menu = plainToClass(MenuEntity, dto)
            const result = await menuRepositoryTransaction.save(menu)
            await this.managerTransaction.commit();
            const response = new BaseResponse(
                'Tạo danh mục thành công',
                result,
            );
            return response;
        } catch (error) {
            await this.managerTransaction.rollBack();
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    async validateCreateMenu(dto: CreateMenuDto) {
        const checkName = await this.menuRepository.findOneBy({ name: dto.name });
        if (checkName) {
            throw new BadRequestException('Tên danh mục sản phẩm đã tồn tại');
        }
        const checkLink = await this.menuRepository.findOneBy({ link: dto.link });
        if (checkLink) {
            throw new BadRequestException('Đường dẫn danh mục sản phẩm đã tồn tại');
        }
        if (dto.parentId) {
            const checkParent = await this.menuRepository.findOneBy({ parentId: dto.parentId });
            if (!checkParent) {
                throw new BadRequestException('Danh mục cha không tồn tại');
            }
        }

    }
}
