import { sql } from 'drizzle-orm';
import { date, pgTable, serial, varchar } from 'drizzle-orm/pg-core';


export const Books = pgTable('book', {

    id: serial('id').primaryKey(),

    title: varchar('title', { length: 127 })
        .notNull(),

    author: varchar('author', { length: 63 })
        .notNull(),

    publicationDate: date('publication_date')
        .default(sql`now()`)
        .notNull(),

    genres: varchar('genres', { length: 31 }).array()
        .default(sql`'{}'::varchar(31)[]`)
        .notNull(),

});

export type Book = typeof Books.$inferSelect
