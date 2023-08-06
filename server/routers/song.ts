import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { songFileLink, song } from 'drizzle/schema';
import { createInsertSchema } from 'drizzle-zod';
import { and, eq } from 'drizzle-orm';

// create input schema
const songFileLinkInput = createInsertSchema(songFileLink);

export const songRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const songs = await ctx.db.query.song.findMany({
      with: {
        fileLinks: true,
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
  updateFileLinks: protectedProcedure
    .input(
      z.object({
        links: songFileLinkInput.array(),
        songId: z.string().nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { songId } = input;
      const fileLinks = await ctx.db.transaction(async tx => {
        await tx
          .delete(songFileLink)
          .where(eq(songFileLink.songId, input.songId));
        if (input.links.length === 0) {
          return [];
        }
        return await tx.insert(songFileLink).values(input.links).returning();
      });
      return {
        fileLinks,
        songId,
      };
    }),
  addOrUpdateFileLink: protectedProcedure
    .input(songFileLinkInput)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db
        .insert(songFileLink)
        .values(input)
        .onConflictDoUpdate({
          target: [songFileLink.songId, songFileLink.label],
          set: {
            url: input.url,
            type: input.type,
          },
        })
        .returning();
      return file[0]!;
    }),
  removeFileLink: protectedProcedure
    .input(
      z.object({
        songId: z.string().nonempty(),
        label: z.string().nonempty(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { songId, label } = input;
      await ctx.db
        .delete(songFileLink)
        .where(
          and(eq(songFileLink.songId, songId), eq(songFileLink.label, label))
        );
      return {
        songId,
        label,
      };
    }),
});

// export type definition of API
export type SongRouter = typeof songRouter;
