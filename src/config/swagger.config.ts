import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
export class SwaggerFactory {
  static readonly URL = 'swagger';
  static create(app: any) {
    const config = new DocumentBuilder()
      .setTitle('thuongthuong.net')
      .setVersion('1.0')
      .addTag('thuongthuong.net')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(this.URL, app, document);
  }
}
