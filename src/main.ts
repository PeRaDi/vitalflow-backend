import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseService } from './db/database.service';
import { initDb } from './db/init-db';
import { rabbitMQConfig } from './rabbitmq/rabbitmq.config';
import { UsersService } from './users/users.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const dbService = app.get(DatabaseService);
    const userService = app.get(UsersService);
    const configService = app.get(ConfigService);

    app.enableCors({
        origin: ['http://localhost:3000', 'http://vital-flow.live:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        optionsSuccessStatus: 204,
    });

    if (process.env.DEBUG) {
        const openApiConfig = new DocumentBuilder()
            .setTitle('vitalFlow Backend')
            .setDescription('API Documentation for vitalFlow Backend')
            .setVersion('0.1')
            .build();

        const document = SwaggerModule.createDocument(app, openApiConfig);
        SwaggerModule.setup('api-doc', app, document);
    }

    const dbStatus = await initDb(dbService, userService, process.env);
    console.log(`Database initialized: ${dbStatus}`);

    app.connectMicroservice(rabbitMQConfig(configService));
    await app.startAllMicroservices();
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
