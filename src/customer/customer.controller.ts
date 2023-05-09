import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { CustomerService } from './customer.service'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { BaseResponse } from 'src/common/response/base.response'

@Controller('customer')
export class CustomerController {
  constructor (private readonly customerService: CustomerService) {}

  @Post('create')
  create (@Body() createCustomerDto: CreateCustomerDto): Promise<BaseResponse> {
    return this.customerService.create(createCustomerDto)
  }

  @Get()
  findAll (): Promise<BaseResponse> {
    return this.customerService.findAll()
  }

  @Get(':id')
  findOne (@Param('id') id: string):Promise<BaseResponse> {
    return this.customerService.findOne(+id)
  }

  @Patch(':id')
  update (
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto)
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.customerService.remove(+id)
  }
}
