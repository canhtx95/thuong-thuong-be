import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { UsersModule } from './users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { databaseConfig } from './config/db.config'
import { AuthModule } from './auth/auth.module'
import { CategoryModule } from './category/category.module'
import { ProductModule } from './product/product.module'
import { MenuModule } from './menu/menu.module'
import { ArticleModule } from './article/article.module'
import { ConfigModule } from '@nestjs/config'
import { OrderModule } from './order/order.module'
import { WebInformationModule } from './web-information/web-information.module'
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module'
import { join } from 'path'
import { MulterModule } from '@nestjs/platform-express'
import { BenefactorModule } from './benefactor/benefactor.module'
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(Object(databaseConfig)),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/uploads'),
      serveRoot: '/uploads/',
    }),
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MenuModule,
    ArticleModule,
    UsersModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    WebInformationModule,
    BenefactorModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
