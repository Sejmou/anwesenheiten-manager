import { createTRPCRouter } from './trpc';
import { songRouter } from './routers/song';
import { setlistRouter } from './routers/setlist';
import { googleDriveRouter } from './routers/google-drive';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  song: songRouter,
  setlist: setlistRouter,
  googleDrive: googleDriveRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
