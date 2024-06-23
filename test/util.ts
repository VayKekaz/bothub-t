import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SuperTest } from 'supertest';
import { AppModule } from '../src/app.module';
import { getRandomString } from '../src/util/util';


export const createTestApp = async (): Promise<INestApplication> => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    return moduleRef.createNestApplication().init();
};

export const getJwt = async (request: SuperTest<any>): Promise<string> => {
    const name = getRandomString();
    const user = {
        name,
        email: `${name}@email.com`,
        password: '12345',
    };
    await request.post('/users/register').send(user);
    const response = await request.post('/users/login')
        .send({ email: user.email, password: user.password });
    return response.body.access_token as string;
};
