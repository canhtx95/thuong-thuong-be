import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { CreateBaseDto } from 'src/common/dto/create-base.dto';
import { ProductContentEntity } from 'src/product/entity/product-content.entity';

export class CreateProductDto extends CreateBaseDto {


  @ApiProperty({ example: '/tranh-giay' })
  @IsNotEmpty()
  link: string;

  // @IsNotEmpty()
  categoryId: number;

  @ApiProperty()
  imageUrl: boolean;

  @ApiProperty({ default: '' })
  productContent: ProductContentEntity;

  @IsNotEmpty()
  categoryLevel1Id: number;
  @IsNotEmpty()
  categoryLevel2Id: number;

}
