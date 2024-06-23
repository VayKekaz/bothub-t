import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RoleGuard } from './user/auth.middleware';
import { ZodExceptionFilter } from './util/zod-exception.filter';


async function createApp() {
    const app = await NestFactory.create(AppModule, { logger: ['verbose', 'debug', 'log', 'warn', 'error'] });
    app.enableShutdownHooks();
    app.useGlobalGuards(new RoleGuard(app.get(Reflector)));
    app.useGlobalFilters(new ZodExceptionFilter());
    return app;
}

createApp()
    .then(app => app.listen(3000));
