import { Module } from '@nestjs/common';
import { WebInformationService } from './web-information.service';
import { WebInformationController } from './web-information.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebInformationEntity } from './entities/web-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebInformationEntity])],
  controllers: [WebInformationController],
  providers: [WebInformationService]
})
export class WebInformationModule {}
