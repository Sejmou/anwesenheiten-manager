// for drizzle stuff to work, you need to create a drizzle.config.ts file in the root of your project
// it should look something like this:
import type { Config } from 'drizzle-kit';

export default {
  schema: './utils/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: 'INSERT YOUR DATABASE URL HERE',
  },
} satisfies Config;
