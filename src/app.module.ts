import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { DbModule } from './db/db.module';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';


@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        DbModule,
        EmailModule,

        UserModule,

        CryptoModule,

        BookModule,
    ],
})
export class AppModule {
}
