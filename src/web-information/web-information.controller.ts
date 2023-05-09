import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { WebInformationService } from './web-information.service'
import { WebInformationDto } from './dto/web-information.dto'
import { BaseResponse } from 'src/common/response/base.response'

@Controller('web-information')
export class WebInformationController {
  constructor (private readonly webInformationService: WebInformationService) {}

  @Post()
  async create (@Body() dto: WebInformationDto): Promise<BaseResponse> {
    return this.webInformationService.create(dto)
  }

  @Get()
  async findAll (): Promise<BaseResponse> {
    return this.webInformationService.findAll()
  }

  @Get(':id')
  async findOne (@Param('id') id: string): Promise<BaseResponse> {
    return this.webInformationService.findOne(+id)
  }

  @Patch()
  async update (
    // @Param('id') id: string,
    @Body() dto: WebInformationDto,
  ): Promise<BaseResponse> {
    return this.webInformationService.update(dto)
  }

  @Delete(':id')
  async remove (@Param('id') id: string): Promise<BaseResponse> {
    return this.webInformationService.remove(+id)
  }
}
