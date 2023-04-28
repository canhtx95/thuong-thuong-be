import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entity/menu.entity';
import { DatabaseTransactionManagerService } from 'src/common/database-transaction-manager';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity])],
  controllers: [MenuController],
  providers: [MenuService, DatabaseTransactionManagerService
  ]
})
export class MenuModule { }
