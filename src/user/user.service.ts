import { Injectable, NotFoundException } from '@nestjs/common';
import { count, eq, getTableColumns } from 'drizzle-orm';
import { CryptoService } from '../crypto/crypto.service';
import { Database, InjectDb } from '../db/db.module';
import { EmailService } from '../email/email.service';
import { User, UserRole, Users } from './user.model';


@Injectable()
export class UserService {
    constructor(
        @InjectDb private readonly db: Database,
        private readonly email: EmailService,
        private readonly crypto: CryptoService,
    ) {
    }

    async getById(id: User['id'], includePassword = false): Promise<
        typeof includePassword extends true
        ? User
        : Omit<User, 'password'>
            | null
    > {
        const selection = getTableColumns(Users);

        if (!includePassword)
            // @ts-ignore
            delete selection.password;

        const res = await this.db.select(selection)
            .from(Users)
            .where(eq(Users.id, id));

        return res[0] ?? null;
    }

    async getByLogin(email: User['email'], password: string): Promise<User | null> {
        const user = await this.db.query.Users.findFirst({ where: eq(Users.email, email) });
        if (!user)
            return null;

        const passwordIsCorrect = await this.crypto.doMatch(password, user.password);
        if (passwordIsCorrect)
            return user;
        return null;
    }

    async create(user: typeof Users.$inferInsert): Promise<User> {
        user.password = await this.crypto.hash(user.password);
        const res = await this.db.insert(Users).values(user).returning();
        return res[0];
    }

    async setRole(id: User['id'], role: UserRole) {
        const where = eq(Users.id, id);
        const exists = await this.db.select({ count: count() }).from(Users).where(where);
        if (!exists)
            throw new NotFoundException(`User with id=${id} not found.`);
        await this.db.update(Users).set({ role: role }).where(where);
    }
}
