import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common'
import { ContactService } from './contact.service'
import { CreateContactDto } from './dto/create-contact.dto'
import { UpdateContactDto } from './dto/update-contact.dto'
import { GetContactDto } from './dto/get-contact.dto'
import { JwtAuthGuard, PublicEndpoint } from 'src/auth/guard/jwt.guard'

@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor (private readonly contactService: ContactService) {}

  @Post()
  @PublicEndpoint()
  create (@Body() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto)
  }
  @Post('update')
  update (@Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(updateContactDto)
  }

  @Post('find')
  find (@Body() getContactDto: GetContactDto) {
    return this.contactService.find(getContactDto)
  }

  @Get(':id')
  findOne (@Param('id') id: string) {
    return this.contactService.findOne(+id)
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.contactService.remove(+id)
  }
}
