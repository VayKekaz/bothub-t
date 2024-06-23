import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CryptoModule } from '../crypto/crypto.module';
import { EmailModule } from '../email/email.module';
import { AuthMiddleware } from './auth.middleware';
import { EmailVerificationService } from './email-verification.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
    controllers: [UserController],
    providers: [
        UserService,
        EmailVerificationService,
    ],
    imports: [
        EmailModule,
        CryptoModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('JWT_SECRET', 'not so secret'),
                signOptions: { expiresIn: '60m' },
            }),
        }),
    ],
    exports: [
        UserService,
    ],
})
export class UserModule implements NestModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('*');
    }
}
