import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpCode,
    Param,
    ParseBoolPipe,
    Post,
    Put,
    Query,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Authorization, MustAuth, MustHaveRole, RequestUser } from './auth.middleware';
import { EmailVerificationService, EmailVerificationToken } from './email-verification.service';
import { User, userRoleSchema, Users } from './user.model';
import { UserService } from './user.service';


const RegisterSchema = createInsertSchema(Users, {
    email: schema => schema.email.email(),
    password: z.string().min(5),
}).omit({
    id: true,
    emailVerified: true,
});

const LoginSchema = RegisterSchema.omit({ name: true });

const PutRoleSchema = z.object({ role: userRoleSchema });

@Controller('users')
export class UserController {
    constructor(
        private readonly service: UserService,
        private readonly emailVerification: EmailVerificationService,
        private readonly jwt: JwtService,
    ) {
    }

    @Post('register')
    @HttpCode(201)
    async register(@Body() body: unknown) {
        const user = RegisterSchema.parse(body);
        const created = await this.service.create(user);
        this.emailVerification.beginVerification(created.email);
        // @ts-ignore bruh
        delete created.password;
        return created;
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: unknown) {
        const login = LoginSchema.parse(body);
        const user = await this.service.getByLogin(login.email, login.password);
        if (!user)
            throw new UnauthorizedException('Wrong email or password provided.');

        // @ts-ignore bruh
        delete user.password;
        const token = this.jwt.sign(user);
        return { access_token: token };
    }

    @Get('email-verification')
    @UseGuards(MustAuth)
    @HttpCode(200)
    async beginEmailVerification(@RequestUser() user: NonNullable<Authorization>) {
        this.emailVerification.beginVerification(user.email);
    }

    @Post('email-verification')
    @UseGuards(MustAuth)
    @HttpCode(200)
    async verifyEmail(
        @RequestUser() user: NonNullable<Authorization>,
        @Body('email_verification_token') token: EmailVerificationToken,
    ) {
        const validated = this.emailVerification.verify(user.email, token);
        return { success: validated };
    }

    @Get('me')
    @UseGuards(MustAuth)
    @HttpCode(200)
    async getSelf(
        @Query('from-db', new DefaultValuePipe(false), ParseBoolPipe) fromDb: boolean,
        @RequestUser() user: NonNullable<Authorization>,
    ) {
        if (!user)
            throw new UnauthorizedException();

        if (!fromDb)
            return user;

        return this.service.getById(user.id);
    }

    @Put(':id/role')
    @MustHaveRole('admin')
    @HttpCode(200)
    async changeRole(
        @Param('id') userId: User['id'],
        @Body() body: unknown,
    ) {
        const { role } = PutRoleSchema.parse(body);
        await this.service.setRole(userId, role);
    }
}
