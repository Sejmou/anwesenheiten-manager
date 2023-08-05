import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../trpc';
import { song, songFile } from 'drizzle/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// create input schema
const songFileInput = createInsertSchema(songFile);

export const songRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const songs = await ctx.db.query.song.findMany({
      with: {
        files: true,
      },
    });

    return {
      songs,
    };
  }),
  addOrUpdateFile: publicProcedure
    .input(songFileInput)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db
        .insert(songFile)
        .values(input)
        .onConflictDoUpdate({
          target: [songFile.songId, songFile.name],
          set: {
            url: input.url,
            type: input.type,
          },
        })
        .returning();
      return file[0]!;
    }),
});

// export type definition of API
export type SongRouter = typeof songRouter;
