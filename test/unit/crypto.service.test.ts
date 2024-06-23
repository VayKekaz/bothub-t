import { INestApplication } from '@nestjs/common';
import { CryptoService } from '../../src/crypto/crypto.service';
import { createTestApp } from '../util';


describe('CryptoService Test', () => {
    let app: INestApplication;
    let service: CryptoService;

    beforeEach(async () => {
        app = await createTestApp();
        service = app.get(CryptoService);
    });

    it('Should uglify password', async () => {
        const password = '123';
        const hash = await service.hash(password);

        expect(hash).not.toBe(password);
    });

    it('Should correctly recognize password', async () => {
        const password = '123';
        const hash = await service.hash(password);

        expect(await service.doMatch(password, hash)).toBe(true);
    });

    it('Should correctly throw on incorrect password', async () => {
        const password = '123';
        const hash = await service.hash(password);

        const expected = 'expected';
        try {
            await service.throwIfNoMatch('incorrect password', hash, 'expected');
        } catch (error) {
            expect(error).toBe(expected);
        }
    });
});
