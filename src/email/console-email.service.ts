import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';


@Injectable()
export class ConsoleEmailService extends EmailService {
    /**
     * Override this to customize logging logic
     * @param text text to be logged to console
     */
    doLog: (text: string) => void = (text: string) => console.log(text);

    //                               receiver, text
    readonly #messageHistory: Array<[string, string]> = [];

    get messageHistory() {
        return structuredClone(this.#messageHistory);
    }

    send(receiver: string, text: string) {
        this.#messageHistory.push([receiver, text]);
        this.doLog(
            `Message to: ${receiver}`
            + '\n' + text,
        );
    }
}
