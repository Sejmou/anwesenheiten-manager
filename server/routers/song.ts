import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../trpc';
import { song, songFile } from 'drizzle/schema';
import { eq } from 'drizzle-orm';
import { InferModel } from 'drizzle-orm';

type NewFile = InferModel<typeof songFile, 'insert'>;

const songFileInput = z.object({
  name: z.string(),
  url: z.string(),
  type: z.enum(songFile.type.enumValues),
  songId: z.string(),
});

// TODO: add procedures for editing and removing songs and editing related data
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
  addFile: publicProcedure
    .input(songFileInput)
    .mutation(async ({ ctx, input }) => {
      const newFile = await ctx.db.insert(songFile).values(input).returning();
      return newFile;
    }),
});

// export type definition of API
export type SongRouter = typeof songRouter;
