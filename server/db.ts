// The DB schema to be used for queries with Drizzle

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const getDatabaseURL = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not set');
  }
  return url;
};

const client = postgres(getDatabaseURL());
export const db = drizzle(client);
