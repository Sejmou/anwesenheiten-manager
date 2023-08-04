import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../trpc';

// TODO: add procedures for editing and removing songs and editing related data
export const songRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const songs = await ctx.prisma.song.findMany();
    return {
      songs,
    };
  }),
  getOne: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const song = await ctx.prisma.song.findUnique({
        where: {
          id: input.id,
        },
      });
      return {
        song,
      };
    }),
});

// export type definition of API
export type SongRouter = typeof songRouter;
