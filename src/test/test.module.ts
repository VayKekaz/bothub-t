import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { TestController } from './test.controller';


@Module({
    controllers: [TestController],
    imports: [UserModule],
})
export class TestModule {
}
