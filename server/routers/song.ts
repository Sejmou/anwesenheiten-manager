import { z } from 'zod';
import { publicProcedure, createTRPCRouter, protectedProcedure } from '../trpc';
import { songAttachment, song } from 'drizzle/schema';
import { createInsertSchema } from 'drizzle-zod';
import { eq } from 'drizzle-orm';

const attachmentInput = createInsertSchema(songAttachment);

export const songRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const songs = await ctx.db.query.song.findMany({
      with: {
        attachments: true,
      },
    });

    return songs;
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
  addOrUpdateAttachment: protectedProcedure
    .input(attachmentInput)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db
        .insert(songAttachment)
        .values(input)
        .onConflictDoUpdate({
          target: [songAttachment.songId, songAttachment.label],
          set: {
            downloadUrl: input.downloadUrl,
            viewUrl: input.viewUrl,
            type: input.type,
          },
        })
        .returning();
      return file[0]!;
    }),
  removeAttachment: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const id = input;
      await ctx.db.delete(songAttachment).where(eq(songAttachment.id, id));
      return;
    }),
});

// export type definition of API
export type SongRouter = typeof songRouter;
