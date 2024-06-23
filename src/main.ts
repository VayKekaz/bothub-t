import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RoleGuard } from './user/auth.middleware';
import { ZodExceptionFilter } from './util/zod-exception.filter';


async function createApp() {
    const app = await NestFactory.create(AppModule, { logger: ['verbose', 'debug', 'log', 'warn', 'error'] });

    app.useGlobalGuards(new RoleGuard(app.get(Reflector)));
    app.useGlobalFilters(new ZodExceptionFilter());

    app.enableShutdownHooks();

    const config = new DocumentBuilder().build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    return app;
}

createApp()
    .then(app => app.listen(3000));
