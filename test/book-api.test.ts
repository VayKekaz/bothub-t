import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { getRandomString } from '../src/util/util';
import { createTestApp, getJwt } from './util';


describe('Books API Test', () => {
    let app: INestApplication;
    let request: supertest.SuperTest<supertest.Test>;
    let jwt: string;


    beforeAll(async () => {
        app = await createTestApp();
        request = supertest(app.getHttpServer());
        jwt = await getJwt(request);
    });

    test('Create, update and delete book', async () => {
        const book = {
            id: undefined,
            title: getRandomString(),
            author: getRandomString(),
            genres: ['genre'],
            publicationDate: undefined,
        };

        await request.post('/books')
            .set('Authorization', `Bearer ${jwt}`)
            .send(book)
            .expect(201)
            .then(response => {
                book.id = response.body.id;
                book.publicationDate = response.body.publicationDate;
                expect(response.body).toEqual(book);
            });

        await request.get('/books')
            .expect(200)
            .then(response => expect(response.body).toContainEqual(book));

        await request.get(`/books/${book.id}`)
            .expect(200)
            .then(response => expect(response.body).toEqual(book));

        book.title = book.title + ' EDITED';

        await request.put(`/books/${book.id}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send(book)
            .expect(200)
            .then(response => expect(response.body).toEqual(book));

        await request.get(`/books/${book.id}`)
            .expect(200)
            .then(response => expect(response.body).toEqual(book));

        await request.delete(`/books/${book.id}`)
            .set('Authorization', `Bearer ${jwt}`)
            .expect(204);

        await request.get('/books')
            .expect(200)
            .then(response => expect(response.body).not.toContainEqual(book));
    });
});
