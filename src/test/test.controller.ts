import { Controller, Get } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { getRandomString } from '../util/util';


@Controller('test')
export class TestController {
    constructor(
        private readonly users: UserService,
    ) {
    }

    @Get('create-admin')
    async createAdminUser() {
        const name = getRandomString(3, 'abcdefghijklmnopqrstuvwxyz');
        const user = {
            name,
            email: `${name}@email.com`,
            password: '123',
            role: 'admin',
        } as const;
        await this.users.create({ ...user });
        return user;
    }
}
