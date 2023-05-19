import { BaseDto } from "src/common/dto/base.dto";
import { ApiProperty } from '@nestjs/swagger';
import { Pagination } from "src/common/service/pagination.service";


export class GetProductsDto extends BaseDto {
    // productId: number;
    // productLink: string;
    categoryId: number;
    categoryLink: string;
}