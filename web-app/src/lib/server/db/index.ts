import postgres from 'postgres';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { type FactoryProvider } from 'injection-js';
import { env } from '$env/dynamic/private';

export class Database extends PostgresJsDatabase { }

export default {
    provide: Database,
    useFactory: () => {
        if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
        const client = postgres(env.DATABASE_URL);
        return drizzle(client, {
            logger: {
                logQuery(query, params) {
                    // logger.debug(`Executing ${query} with ${inspect(params)}`);
                },
            },
        });
    },
} satisfies FactoryProvider;