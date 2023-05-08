import { Module } from '@nestjs/common';
import { WebInformationService } from './web-information.service';
import { WebInformationController } from './web-information.controller';

@Module({
  controllers: [WebInformationController],
  providers: [WebInformationService]
})
export class WebInformationModule {}
