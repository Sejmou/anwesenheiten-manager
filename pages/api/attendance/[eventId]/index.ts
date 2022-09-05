import { Singer } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next/types';
import prisma from '../../../../lib/prisma';

export type SingerAttendance = Singer & {
  attending: boolean;
};

const attendancesRequestHandler: NextApiHandler = async (
  req,
  res: NextApiResponse<SingerAttendance[]>
) => {
  const token = await getToken({ req });
  if (!token) {
    // Client not authorized!
    res.status(401).end();
    return;
  }

  try {
    const eventId = extractQueryParamAsString(req, 'eventId');
    const { method } = req;
    if (method === 'GET') {
      const attendingSingerIds = (
        await prisma.eventAttendance.findMany({
          where: { eventId },
          select: { singerId: true },
        })
      ).map(obj => obj.singerId);
      const singers = await prisma.singer.findMany();
      const singerAttendances = singers.map(singer => ({
        ...singer,
        attending: attendingSingerIds.includes(singer.id),
      }));
      res.send(singerAttendances);
    } else {
      throw Error('HTTP method ' + method + ' not supported by this endpoint!');
    }

    res.end();
  } catch (error) {
    console.error(error);
    res.status(400).end();
  }
};

export default attendancesRequestHandler;

export function extractQueryParamAsString(
  req: NextApiRequest,
  paramName: string,
  required = true
) {
  const paramValue = req.query[paramName];
  if (!paramValue) {
    if (required)
      throw Error(`No value for query parameter '${paramName}' provided!`);
    else return '';
  }
  if (typeof paramValue !== 'string') {
    throw Error(`Multiple values for query parameter '${paramName}' provided!`);
  }
  return paramValue;
}
