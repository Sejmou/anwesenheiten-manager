import { Singer as SingerDB, VoiceGroup } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextApiHandler, NextApiResponse } from 'next/types';
import prisma from '../../../lib/prisma';
import { z } from 'zod';

export type Singer = Pick<
  SingerDB,
  'firstName' | 'lastName' | 'voiceGroup' | 'id'
>;

const NewSingerValidator = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  voiceGroup: z.string(), // there's apparently not a good way to validate against the VoiceGroup enum from the database (https://stackoverflow.com/q/71782572/13727176) - will need additional checks
});

export type NewSinger = z.infer<typeof NewSingerValidator>;

const NewSingersValidator = z.array(NewSingerValidator);

const singerRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse<Singer[]>
) => {
  const token = await getToken({ req });
  if (!token) {
    // Client not authorized!
    res.status(401).end();
    return;
  }

  try {
    const { method, body } = req;
    if (method === 'GET') {
      const singersDB = await prisma.singer.findMany();
      const singers: Singer[] = singersDB.map(u => ({
        firstName: u.firstName ?? '-',
        lastName: u.lastName ?? '-',
        voiceGroup: u.voiceGroup,
        id: u.id,
      }));
      res.send(singers);
    } else if (method === 'POST') {
      const bodyJson = JSON.parse(body);
      const newSingers = NewSingersValidator.parse(bodyJson);
      for (const singer of newSingers) {
        if (VoiceGroup[singer.voiceGroup as VoiceGroup] === undefined) {
          throw Error(
            `One of the provided singer objects contains an invalid voice group value (${singer.voiceGroup})`
          );
        }
      }
      const validatedSingers = newSingers as Singer[];
      await prisma.singer.createMany({ data: validatedSingers });
    } else {
      throw Error('HTTP method ' + method + ' not supported by this endpoint!');
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default singerRequestHandler;
