import { createTRPCRouter, protectedProcedure } from '../trpc';
import { setlist, setlistSongInfo } from 'drizzle/schema';
import { z } from 'zod';

const newSetlistInput = z.object({
  songIds: z.array(z.string()),
  name: z.string().min(1),
});

export const setlistRouter = createTRPCRouter({
  add: protectedProcedure
    .input(newSetlistInput)
    .mutation(async ({ ctx, input }) => {
      const { name, songIds } = input;

      const setlistWithSongs = await ctx.db.transaction(async tx => {
        const newSetlistResp = await tx
          .insert(setlist)
          .values({
            name,
          })
          .returning({ id: setlist.id });
        const setlistId = newSetlistResp[0]!.id;

        const songInfoInputs = songIds.map((songId, i) => ({
          songId,
          setlistId,
          order: i,
        }));

        await tx.insert(setlistSongInfo).values(songInfoInputs);

        return await tx.query.setlist.findFirst({
          where: (setlist, { eq }) => eq(setlist.id, setlistId),
          with: {
            setlistSongInfo: {
              with: {
                song: true,
              },
              orderBy: (setlistSongInfo, { asc }) => asc(setlistSongInfo.order),
            },
          },
        });
      });

      if (!setlistWithSongs) {
        throw new Error('Expected setlist to be created, but it was not.');
      }

      return setlistWithSongs;
    }),
});

// export type definition of API
export type SetlistRouter = typeof setlistRouter;
