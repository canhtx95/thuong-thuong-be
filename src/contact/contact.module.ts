import { Module } from '@nestjs/common'
import { ContactService } from './contact.service'
import { ContactController } from './contact.controller'
import { Contact } from './entities/contact.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WebsocketGateway } from 'src/config/websocket.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  controllers: [ContactController],
  providers: [ContactService, WebsocketGateway],
})
export class ContactModule {}
