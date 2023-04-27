import { BaseDto } from "src/common/dto/base.dto";
import { ApiProperty } from '@nestjs/swagger';


export class GetProductsDto extends BaseDto {
    productId: number;
    productLink: string;
    categoryId: number;
    categoryLink: string;

}