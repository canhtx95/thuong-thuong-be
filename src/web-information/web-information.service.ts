import { Injectable } from '@nestjs/common';
import { CreateWebInformationDto } from './dto/create-web-information.dto';
import { UpdateWebInformationDto } from './dto/update-web-information.dto';

@Injectable()
export class WebInformationService {
  create(createWebInformationDto: CreateWebInformationDto) {
    return 'This action adds a new webInformation';
  }

  findAll() {
    return `This action returns all webInformation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} webInformation`;
  }

  update(id: number, updateWebInformationDto: UpdateWebInformationDto) {
    return `This action updates a #${id} webInformation`;
  }

  remove(id: number) {
    return `This action removes a #${id} webInformation`;
  }
}
