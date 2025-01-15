import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DatabaseService } from './db/database.service';
import { initDb } from './db/init-db';
import { UsersService } from './users/users.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const dbService = app.get(DatabaseService);
    const userService = app.get(UsersService);

    if (process.env.DEBUG) {
        const openApiConfig = new DocumentBuilder()
            .setTitle("vitalFlow Backend")
            .setDescription("API Documentation for vitalFlow Backend")
            .setVersion("0.1")
            .build();

        const document = SwaggerModule.createDocument(app, openApiConfig);
        SwaggerModule.setup('api-doc', app, document);
    }

    const dbStatus = await initDb(dbService, userService, process.env);
    console.log(`Database initialized: ${dbStatus}`);

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
