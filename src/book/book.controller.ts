import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Database, InjectDb } from '../db/db.module';
import { MustHaveRole } from '../user/auth.middleware';
import { Book, Books } from './book.model';


const CreateBookSchema = createInsertSchema(Books, {
    genres: z.array(z.string()),
}).omit({ id: true });

@Controller('books')
export class BookController {
    constructor(
        @InjectDb private readonly db: Database,
        // no service due to simple logic
    ) {
    }

    @Get()
    @HttpCode(200)
    getAll() {
        return this.db.select().from(Books);
    }

    @Get(':id')
    @HttpCode(200)
    async getById(@Param('id') id: Book['id']) {
        const found = await this.db.select().from(Books).where(eq(Books.id, id));
        if (!found[0])
            throw new NotFoundException(`Book with id=${id} not found.`);
        return found[0];
    }

    @Post()
    @MustHaveRole('admin')
    @HttpCode(201)
    async create(@Body() body: unknown) {
        const book = CreateBookSchema.parse(body);
        const created = await this.db.insert(Books).values(book).returning();
        return created[0];
    }

    @Put(':id')
    @MustHaveRole('admin')
    @HttpCode(200)
    async update(@Param('id') id: Book['id'], @Body() body: unknown) {
        const book = CreateBookSchema.parse(body);
        const updated = await this.db.update(Books).set(book).where(eq(Books.id, id)).returning();
        return updated[0];
    }

    @Delete(':id')
    @MustHaveRole('admin')
    @HttpCode(204)
    async delete(@Param('id') id: Book['id']) {
        await this.db.delete(Books).where(eq(Books.id, id));
    }
}
