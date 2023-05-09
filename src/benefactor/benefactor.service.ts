import { Injectable } from '@nestjs/common'
import { CreateBenefactorDto } from './dto/create-benefactor.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { BenefactorEntity } from './entities/benefactor.entity'
import { Repository } from 'typeorm'
import { BaseResponse } from 'src/common/response/base.response'

@Injectable()
export class BenefactorService {
  constructor (
    @InjectRepository(BenefactorEntity)
    private readonly repository: Repository<BenefactorEntity>,
  ) {}

  async create (dto: CreateBenefactorDto): Promise<BaseResponse> {
    const result = await this.repository.save(dto.benefactors)
    return new BaseResponse('Thêm nhà từ thiện thành công', result)
  }

  async findAll (): Promise<BaseResponse> {
    return new BaseResponse(
      'Danh sách người từ thiện',
      await this.repository.find(),
    )
  }

  // findOne (id: number) {
  //   return `This action returns a #${id} benefactor`
  // }

  // update (id: number, updateBenefactorDto: UpdateBenefactorDto) {
  //   return `This action updates a #${id} benefactor`
  // }

  async remove (id: number): Promise<BaseResponse> {
    return new BaseResponse('Xóa thành công', await this.repository.delete(id))
  }
}
