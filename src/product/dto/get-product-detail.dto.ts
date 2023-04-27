import { BaseDto } from "src/common/dto/base.dto";
import { ApiProperty } from '@nestjs/swagger';


export class GetProductDetailDto extends BaseDto {
    productId: number;
    productLink: string;

}