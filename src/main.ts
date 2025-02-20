import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DatabaseService } from './db/database.service';
import { initDb } from './db/init-db';
import { UsersService } from './users/users.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const dbService = app.get(DatabaseService);
    const userService = app.get(UsersService);

    app.enableCors({
        origin: [process.env.FRONTEND_URL],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        accessControlAllowOrigin: process.env.FRONTEND_URL,
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

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
