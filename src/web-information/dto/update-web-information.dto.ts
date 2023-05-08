import { PartialType } from '@nestjs/swagger';
import { CreateWebInformationDto } from './create-web-information.dto';

export class UpdateWebInformationDto extends PartialType(CreateWebInformationDto) {}
