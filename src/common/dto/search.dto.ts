
import { BaseDto } from 'src/common/dto/base.dto';

export class SearchDto extends BaseDto  {

  name: string
  categoryId: number
  isHighlight: boolean
  isActive: boolean


}
