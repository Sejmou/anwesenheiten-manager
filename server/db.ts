import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as baseSchema from 'drizzle/schema'; // generated schema (does not include relations)
import * as relations from 'drizzle/relations'; // manually added relations

const getDatabaseURL = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not set');
  }
  return url;
};

const connection = postgres(getDatabaseURL());

export const db = drizzle(connection, {
  schema: {
    ...baseSchema,
    ...relations,
  },
});

export type DrizzleDBClient = typeof db;
