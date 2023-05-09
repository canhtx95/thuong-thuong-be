import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { BenefactorService } from './benefactor.service'
import { CreateBenefactorDto } from './dto/create-benefactor.dto'
import { BaseResponse } from 'src/common/response/base.response'

@Controller('benefactor')
export class BenefactorController {
  constructor (private readonly benefactorService: BenefactorService) {}

  @Post()
  async create (
    @Body() createBenefactorDto: CreateBenefactorDto,
  ): Promise<BaseResponse> {
    return this.benefactorService.create(createBenefactorDto)
  }

  @Get()
  async findAll (): Promise<BaseResponse> {
    return this.benefactorService.findAll()
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.benefactorService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBenefactorDto: UpdateBenefactorDto) {
  //   return this.benefactorService.update(+id, updateBenefactorDto);
  // }

  @Delete(':id')
  async remove (@Param('id') id: string): Promise<BaseResponse> {
    return this.benefactorService.remove(+id)
  }
}
