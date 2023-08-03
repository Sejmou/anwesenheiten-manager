import { Setlist, SetlistSongInfo } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next/types';
import prisma from 'lib/prisma';
import { z } from 'zod';

const validatePostRequestContent = z.object({
  songIds: z.array(z.string()),
  title: z.string().min(1),
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

  if (method !== 'POST') {
    res.status(400).end();
    return;
  }

  try {
    const { songIds, title } = validatePostRequestContent.parse(
      JSON.parse(req.body)
    );

    // TODO: figure out how to do stuff with transactions (probably huge brainf*ck with prisma)
    // consider switching to drizzle if this project were to continue
    const newSetlist = await prisma.setlist.create({
      data: {
        title,
      },
    });

    const setlistSongs = songIds.map((songId, i) => ({
      song_id: songId,
      setlist_id: newSetlist.id,
      order: i,
    }));

    await prisma.setlistSongInfo.createMany({
      data: setlistSongs,
    });

    const updatedSetlist = await prisma.setlist.findUnique({
      where: {
        id: newSetlist.id,
      },
      include: {
        entries: true,
      },
    });

    res.status(200).json(updatedSetlist!);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default setlistRequestHandler;
