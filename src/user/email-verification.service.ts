import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { Database, InjectDb } from '../db/db.module';
import { EmailService } from '../email/email.service';
import { getRandomString } from '../util/util';
import { type User, Users } from './user.model';


export type EmailVerificationToken = string

@Injectable()
export class EmailVerificationService implements OnApplicationShutdown {
    private readonly logger = new Logger(this.constructor.name);

    private readonly tokenLifetimeHours: number;

    private readonly emailTokens = new Map<User['email'], EmailVerificationToken>();
    private readonly dateIssuedTokenFor = new Map<Date, User['email']>();

    private readonly interval: NodeJS.Timer;

    constructor(
        config: ConfigService,
        @InjectDb private readonly db: Database,
        private readonly email: EmailService,
    ) {
        this.tokenLifetimeHours = parseFloat(config.get('EMAIL_VERIFICATION_TOKEN_LIFETIME_HOURS', '0.5'));
        this.interval = setInterval(() => this.revokeExpiredTokens(), 2 * 60 * 1000);
    }

    beginVerification(email: User['email']): void {
        const token = getRandomString();
        this.emailTokens.set(email, token);
        this.dateIssuedTokenFor.set(new Date(), email);
        this.email.send(email, `Email verification token: \`${token}\``);
        this.logger.debug(`Began email verification process for ${email}`);
    }

    verify(email: User['email'], token: unknown) {
        if (this.emailTokens.get(email) !== token)
            return false;

        this.db.update(Users)
            .set({ emailVerified: true })
            .where(eq(Users.email, email))
            .then(() => this.logger.debug(`Email ${email} is set as validated.`)); // no need making this function async
        return true;
    }

    private revokeExpiredTokens() {
        const now = new Date();
        const emailsRevoke = [];
        for (const [date, email] of this.dateIssuedTokenFor.entries()) {
            const tokenAgeHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            if (tokenAgeHours > this.tokenLifetimeHours)
                if (tokenAgeHours > this.tokenLifetimeHours) {
                    this.emailTokens.delete(email);
                    this.dateIssuedTokenFor.delete(date);
                    emailsRevoke.push(email);
                }
        }
        if (emailsRevoke.length > 0)
            this.logger.verbose(`Email verification tokens revoken: ${emailsRevoke.join(' ')}`);
    }

    onApplicationShutdown() {
        clearInterval(this.interval);
    }
}
