import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { songFile, song } from 'drizzle/schema';
import { createInsertSchema } from 'drizzle-zod';
import { eq } from 'drizzle-orm';
import type { Song } from 'drizzle/models';

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
  add: protectedProcedure
    .input(z.string().array())
    .mutation(async ({ ctx, input }) => {
      const songNames = input;
      const createdSongs = await ctx.db
        .insert(song)
        .values(songNames.map(name => ({ name })))
        .onConflictDoNothing()
        .returning();
      const failures = songNames.filter(
        name => !createdSongs.some(song => song.name === name)
      );
      return {
        createdSongs,
        failures,
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
