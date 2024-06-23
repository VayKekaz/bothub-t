import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { ConsoleEmailService } from '../src/email/console-email.service';
import { EmailService } from '../src/email/email.service';
import { getRandomString } from '../src/util/util';
import { createTestApp } from './util';


describe('Auth System Test', () => {
    let app: INestApplication;
    let emailService: ConsoleEmailService;
    let request: supertest.SuperTest<supertest.Test>;


    beforeAll(async () => {
        app = await createTestApp();
        emailService = app.get(EmailService) as ConsoleEmailService;
        request = supertest(app.getHttpServer());
    });

    test('Auth flow test', async () => {
        const name = getRandomString();
        const user = {
            id: undefined,
            name,
            email: `${name}@email.com`,
            password: '12345',
        };
        await request.post('/users/register')
            .send(user)
            .expect(201)
            .then(response => {
                expect(response.body.id).toBeDefined();
                user.id = response.body.id;
                expect(response.body.email).toEqual(user.email);
                expect(response.body.name).toEqual(user.name);
                expect(response.body.password).toBeUndefined();
            });

        let jwt: string | null = null;
        await request.post('/users/login')
            .send({ email: user.email, password: user.password })
            .expect(200)
            .then(response => {
                expect(typeof response.body.access_token).toBe('string');
                jwt = response.body.access_token;
            });

        let emailToken: string | null = null;
        for (const [email, token] of emailService.messageHistory) {
            if (email === user.email)
                emailToken = token.substring(token.indexOf('`') + 1, token.lastIndexOf('`'));
        }

        await request.post('/users/email-verification')
            .send({ email_verification_token: emailToken })
            .set('Authorization', `Bearer ${jwt}`)
            .expect(200)
            .then(response => {
                expect(response.body.success).toBe(true);
            });

        await request.get('/users/me?from-db=true')
            .send({ token: emailToken })
            .set('Authorization', `Bearer ${jwt}`)
            .expect(200)
            .then(response => {
                expect(response.body.id).toEqual(user.id);
                expect(response.body.name).toEqual(user.name);
                expect(response.body.email).toEqual(user.email);
                expect(response.body.emailVerified).toBe(true);
            });
    });
});
