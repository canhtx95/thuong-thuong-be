import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebInformationService } from './web-information.service';
import { CreateWebInformationDto } from './dto/create-web-information.dto';
import { UpdateWebInformationDto } from './dto/update-web-information.dto';

@Controller('web-information')
export class WebInformationController {
  constructor(private readonly webInformationService: WebInformationService) {}

  @Post()
  create(@Body() createWebInformationDto: CreateWebInformationDto) {
    return this.webInformationService.create(createWebInformationDto);
  }

  @Get()
  findAll() {
    return this.webInformationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.webInformationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWebInformationDto: UpdateWebInformationDto) {
    return this.webInformationService.update(+id, updateWebInformationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.webInformationService.remove(+id);
  }
}
