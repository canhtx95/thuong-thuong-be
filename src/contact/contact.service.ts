import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateContactDto } from './dto/create-contact.dto'
import { UpdateContactDto } from './dto/update-contact.dto'
import { Repository } from 'typeorm'
import { Contact } from './entities/contact.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { GetContactDto } from './dto/get-contact.dto'
import { plainToClass } from 'class-transformer'
import { BaseResponse } from 'src/common/response/base.response'

@Injectable()
export class ContactService {
  constructor (
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}
  async create (createContactDto: CreateContactDto) {
    return await this.contactRepository.save(createContactDto)
  }

  async find (dto: GetContactDto) {
    try {
      let searchById = ''
      let searchByStatus = ''
      let searchByName = ''
      if (dto.id) searchById = `AND id = ${dto.id}`
      if (dto.status != null) searchByStatus = `AND status = ${dto.status}`
      if (dto.name) searchByName = `AND name LIKE :name`

      const res = await this.contactRepository
        .createQueryBuilder('contact')
        .where(`1=1 ${searchById} ${searchByStatus} ${searchByName}`, {
          name: `%${dto.name}%`,
        })
        .getMany()
      return new BaseResponse('thành công ', res)
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async findOne (id: number) {
    return await this.contactRepository.findOneBy({ id })
  }

  async update (dto: UpdateContactDto) {
    try {
      delete dto.id
      if (!dto.ids || dto.ids.length == 0) {
        throw new Error('id liên hệ không được để trống')
      }
      const updateContact = dto.ids.map(id => {
        return { ...plainToClass(Contact, dto), id }
      })

      const result = await this.contactRepository.save(updateContact)
      const response = new BaseResponse('Cập nhật liên hệ thành công ', result)
      return response
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async remove (id: number) {
    return await this.contactRepository.delete(id)
  }
}
