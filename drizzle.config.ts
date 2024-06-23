import { defineConfig } from 'drizzle-kit';


export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema.ts',
    out: './migrations',
    dbCredentials: {
        host: 'localhost',
        port: '5432',
        user: 'bh',
        password: 'bh',
        database: 'bh',
        ssl: false,
    },
    migrations: { schema: 'public' },
});
