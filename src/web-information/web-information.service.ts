import { WebInformationDto } from './dto/web-information.dto'
import { BaseResponse } from 'src/common/response/base.response'
import { InjectRepository } from '@nestjs/typeorm'
import { WebInformationEntity } from './entities/web-information.entity'
import { Repository } from 'typeorm'
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common'
import { plainToClass } from 'class-transformer'
@Injectable()
export class WebInformationService {
  constructor (
    @InjectRepository(WebInformationEntity)
    private readonly repository: Repository<WebInformationEntity>,
  ) {}

  async create (dto: WebInformationDto): Promise<BaseResponse> {
    try {
      const web = plainToClass(WebInformationEntity, dto)
      const result = await this.repository.save(web)
      const response = new BaseResponse('Thành công', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findAll (): Promise<BaseResponse> {
    const response = new BaseResponse(
      'Thành công',
      await this.repository.find(),
    )
    return response
  }

  async findOne (id: number): Promise<BaseResponse> {
    return new BaseResponse(
      'Thành công',
      await this.repository.findOneBy({ id }),
    )
  }

  async update (dto: WebInformationDto): Promise<BaseResponse> {
    try {
      const web = plainToClass(WebInformationEntity, dto)
      delete web.key
      const result = await this.repository.save(web)
      const response = new BaseResponse('Thành công', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async remove (id: number): Promise<BaseResponse> {
    const response = new BaseResponse(
      'Xóa thành công',
      await this.repository.delete(id),
    )
    return response
  }
}
