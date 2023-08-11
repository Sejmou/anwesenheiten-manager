import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

const getConnectionString = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'Could not load connection string for drizzle config - no DATABASE_URL in environment variables!'
    );
  }
  return process.env.DATABASE_URL;
};

export default {
  schema: './utils/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: getConnectionString(),
  },
} satisfies Config;
