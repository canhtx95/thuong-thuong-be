import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetContactDto } from './dto/get-contact.dto';
import { GetListContactDto } from './dto/get-list-contact.dto';
import { plainToClass } from 'class-transformer';
import { BaseResponse } from 'src/common/response/base.response';
import { WebsocketGateway } from 'src/config/websocket.gateway';
import { Pagination } from 'src/common/service/pagination.service';
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async create(createContactDto: CreateContactDto) {
    const createdContact = await this.contactRepository.save(createContactDto);
    // Gửi thông tin createdContact qua WebSocketGateway
    this.websocketGateway.server.emit('newContact', createdContact);
    return createdContact;
  }

  async find(dto: GetContactDto) {
    try {
      let searchById = '';
      let searchByStatus = '';
      let searchByName = '';
      if (dto.id) searchById = `AND id = ${dto.id}`;
      if (dto.status != null) searchByStatus = `AND status = ${dto.status}`;
      if (dto.name) searchByName = `AND name LIKE :name`;

      const res = await this.contactRepository
        .createQueryBuilder('contact')
        .where(`1=1 ${searchById} ${searchByStatus} ${searchByName}`, {
          name: `%${dto.name}%`,
        })
        .getMany();
      return new BaseResponse('thành công ', res);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    return await this.contactRepository.findOneBy({ id });
  }

  async update(dto: UpdateContactDto) {
    try {
      delete dto.id;
      if (!dto.ids || dto.ids.length == 0) {
        throw new Error('id liên hệ không được để trống');
      }
      const updateContact = dto.ids.map((id) => {
        return { ...plainToClass(Contact, dto), id };
      });

      const result = await this.contactRepository.save(updateContact);
      const response = new BaseResponse('Cập nhật liên hệ thành công ', result);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: number) {
    return await this.contactRepository.delete(id);
  }

  // phương thức get
  async get(dto: GetListContactDto) {
    try {
      let searchById = 'AND contact.id = :id';
      let searchByStatus = 'AND contact.status = :status';
      let searchByName = `AND contact.name LIKE :name`;
      let searchByEmail = `AND contact.email LIKE :email`;
      let searchByPhone = `AND contact.phone LIKE :phone`;

      if (!dto.id) {
        searchById = '';
      }
      if (dto.status !== 0 && dto.status !== 1) {
        searchByStatus = '';
      }
      if (!dto.email) {
        searchByEmail = '';
      }
      if (!dto.phone) {
        searchByPhone = '';
      }
      if (!dto.name) {
        searchByName = '';
      }
      const pagination = new Pagination(dto.page, dto.size);
      const data = await this.contactRepository
        .createQueryBuilder('contact')
        .where(
          `contact.softDeleted = 0 ${searchById} ${searchByStatus} ${searchByName} ${searchByEmail} ${searchByPhone} `,
          {
            id: dto.id,
            status: dto.status,
            email: `%${dto.email}%`,
            phone: `%${dto.phone}%`,
            name: `%${dto.name}%`,
          },
        )
        .orderBy('contact.id', 'DESC')
        .skip(pagination.skip)
        .take(pagination.size)
        .getManyAndCount();
      const contact = data[0];
      pagination.createResult(data[1]);
      return new BaseResponse('Thông tin liên hệ', {
        contact: contact,
        pagination,
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
