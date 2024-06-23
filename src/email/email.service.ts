export abstract class EmailService {
    abstract send(receiver: string, text: string): void
}
