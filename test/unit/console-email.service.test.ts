import { INestApplication } from '@nestjs/common';
import { ConsoleEmailService } from '../../src/email/console-email.service';
import { EmailService } from '../../src/email/email.service';
import { createTestApp } from '../util';


describe('ConsoleEmailService Test', () => {
    let app: INestApplication;
    let service: ConsoleEmailService;

    const logHistory: Array<string> = [];
    const mockLog = (text: string) => logHistory.push(text);

    beforeEach(async () => {
        app = await createTestApp();
        service = app.get(EmailService) as ConsoleEmailService;
        service.doLog = mockLog;
    });

    it('Should save history', async () => {
        const receiver = 'receiver';
        const text = 'text';
        service.send(receiver, text);

        expect(logHistory.at(-1)).toContain(receiver);
        expect(logHistory.at(-1)).toContain(text);
        expect(service.messageHistory).toContainEqual([receiver, text]);
    });
});
