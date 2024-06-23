import { defineConfig } from 'drizzle-kit';


try {
    require('dotenv').config();
} catch {
    // ignore, might run inside docker
}


export default defineConfig({
    dialect: 'postgresql',
    schema: './src/schema.ts',
    out: './migrations',
    dbCredentials: {
        // @ts-ignore bug?? TODO remove
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DB,
        ssl: false,
    },
    migrations: { schema: 'public' },
});
