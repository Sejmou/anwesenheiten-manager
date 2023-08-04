import type { inferAsyncReturnType } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getSession } from 'next-auth/react';
import { db } from 'server/db';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const session = await getSession({ req: opts.req });

  return {
    session,
    db,
  };
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>;
