import { boolean, char, pgEnum, pgTable, serial, unique, varchar } from 'drizzle-orm/pg-core';
import { z } from 'zod';


export const userRole = pgEnum('user_role', [
    'admin',
]);
export const userRoleSchema = z.enum(userRole.enumValues);
export type UserRole = z.infer<typeof userRoleSchema>;

export const Users = pgTable('user', {

    id: serial('id')
        .primaryKey(),

    email: varchar('email', { length: 63 })
        .notNull(),

    name: varchar('name', { length: 31 })
        .notNull(),

    password: char('password', { length: 60 })
        .notNull(),

    emailVerified: boolean('email_verified')
        .default(false),

    role: userRole('role'),

}, Users => ({
    emailIndex: unique('unique_users__email').on(Users.email),
    nameIndex: unique('unique_users__name').on(Users.name),
}));

export type User = typeof Users.$inferSelect;
