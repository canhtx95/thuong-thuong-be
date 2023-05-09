import { Module } from '@nestjs/common';
import { BenefactorService } from './benefactor.service';
import { BenefactorController } from './benefactor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BenefactorEntity } from './entities/benefactor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BenefactorEntity])],
  controllers: [BenefactorController],
  providers: [BenefactorService]
})
export class BenefactorModule {}
