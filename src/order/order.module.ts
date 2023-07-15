import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { ProductEntity } from 'src/product/entity/product.entity';
import { WebsocketGateway } from './websocket.gateway'; // Thay thế đường dẫn tới WebSocketGateway của bạn

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, ProductEntity])],
  controllers: [OrderController],
  providers: [OrderService, WebsocketGateway], // Thêm WebSocketGateway vào providers
})
export class OrderModule {}
