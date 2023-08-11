// This script is supposed to be run whenever the database is changed/updated.
// It makes sure that fuzzy string matching works by adding the corresponding DB extension.
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { exit } from 'process';

dotenv.config();

const getDatabaseURL = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL not set');
  }
  return url;
};

const connection = postgres(getDatabaseURL());
const client = drizzle(connection);

async function additionalDBConfig() {
  console.log('Running additional DB config...');
  console.log(
    'Adding fuzzy string matching extension to database (in case it has not been added yet)'
  );
  await client.execute(sql`CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;`);
  console.log('Done.\n');
  exit();
}

additionalDBConfig();
