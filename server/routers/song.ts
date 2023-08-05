import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { song, songFile } from 'drizzle/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { eq } from 'drizzle-orm';

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
  updateFiles: protectedProcedure
    .input(
      z.object({
        files: songFileInput.array(),
        songId: z.string().nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { songId } = input;
      const files = await ctx.db.transaction(async tx => {
        await tx.delete(songFile).where(eq(songFile.songId, input.songId));
        if (input.files.length === 0) {
          return [];
        }
        return await tx.insert(songFile).values(input.files).returning();
      });
      return {
        files,
        songId,
      };
    }),
  addOrUpdateFile: protectedProcedure
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
