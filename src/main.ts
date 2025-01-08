import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.DEBUG) {
    const openApiConfig = new DocumentBuilder()
      .setTitle("vitalFlow Backend")
      .setDescription("API Documentation for vitalFlow Backend")
      .setVersion("0.1")
      .build();

    const document = SwaggerModule.createDocument(app, openApiConfig);
    SwaggerModule.setup('api-doc', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
