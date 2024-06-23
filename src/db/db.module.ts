import { Global, Inject, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../schema';


const DbToken = 'DATABASE_TOKEN';
export const InjectDb = Inject(DbToken);
export type Database = NodePgDatabase<typeof schema>

@Global()
@Module({
    providers: [
        {
            provide: DbToken,
            inject: [ConfigService],
            useFactory: (env: ConfigService) => drizzle(new Pool({
                host: env.get('DATABASE_HOST', 'localhost'),
                port: env.get('DATABASE_PORT', 5432),
                user: env.getOrThrow('DATABASE_USER'),
                password: env.getOrThrow('DATABASE_PASSWORD'),
                database: env.getOrThrow('DATABASE_DB'),
            }), { schema }),
        },
    ],
    exports: [DbToken],
})
export class DbModule {
}
