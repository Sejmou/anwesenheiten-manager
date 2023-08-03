import { NextApiHandler, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from 'lib/prisma';
import { Event } from '@prisma/client';

export const calendarRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse<Event[]>
) => {
  const token = await getToken({ req });
  if (!token) {
    // Client not authorized!
    res.status(401).end();
    return;
  }

  try {
    const { method } = req;
    if (method === 'GET') {
      const events = await prisma.event.findMany();
      res.send(events);
    } else {
      throw Error('HTTP method ' + method + ' not supported by this endpoint!');
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default calendarRequestHandler;
