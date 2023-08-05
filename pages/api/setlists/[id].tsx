import { Setlist, SetlistSongInfo } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'lib/prisma';
import { z } from 'zod';

const validatePutRequestContent = z.object({
  songIds: z.array(z.string()),
  name: z.string().min(1),
});

const setlistRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse<Setlist & { entries: SetlistSongInfo[] }>
) => {
  const token = await getToken({ req });
  if (!token) {
    // Client not authorized!
    res.status(401).end();
    return;
  }

  const { method } = req;

  if (method === 'PUT') {
    try {
      const { songIds, name } = validatePutRequestContent.parse(
        JSON.parse(req.body)
      );

      const { id } = req.query;

      if (typeof id !== 'string') {
        res.status(400).end();
        return;
      }

      if (!id) {
        res.status(400).end();
        return;
      }

      // TODO: figure out how to do stuff with transactions (probably huge brainf*ck with prisma)
      // consider switching to drizzle if this project were to continue
      await prisma.setlist.update({
        where: {
          id,
        },
        data: {
          name,
        },
      });

      // delete old selist entries
      await prisma.setlistSongInfo.deleteMany({
        where: {
          setlistId: id,
        },
      });

      // create new ones
      await prisma.setlistSongInfo.createMany({
        data: songIds.map((songId, i) => ({
          setlistId: id as string,
          songId: songId,
          order: i,
        })),
      });

      // return updated setlist
      const updatedSetlistWithEntries = await prisma.setlist.findUnique({
        where: {
          id: id as string,
        },
        include: {
          entries: true,
        },
      });

      res.status(200).json(updatedSetlistWithEntries!);

      res.end();
    } catch (error) {
      console.error(error);
      res.status(400).end();
    }
  } else if (method === 'DELETE') {
    const { id } = req.query;

    if (typeof id !== 'string') {
      res.status(400).end();
      return;
    }

    if (!id) {
      res.status(400).end();
      return;
    }

    try {
      const deletedSetlist = await prisma.setlist.delete({
        where: {
          id: id as string,
        },
        include: {
          entries: true,
        },
      });

      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(400).end();
    }
  } else {
    res.status(400).end();
  }
};

export default setlistRequestHandler;
